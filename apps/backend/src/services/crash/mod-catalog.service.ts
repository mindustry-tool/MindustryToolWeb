import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { stripColors } from '@mindustry-tool/api';
import { type ModInfoDto } from '@mindustry-tool/api';
import { OctokitService } from '@/services/octokit/octokit.service';

interface MindustryRawMod {
	repo: string;
	internalName?: string;
	name: string;
	author?: string;
	lastUpdated?: string;
	stars?: number;
	version?: string;
	minGameVersion?: string;
	hasIcon?: boolean;
	description?: string;
}

const GITHUB_MODS_URL = 'https://raw.githubusercontent.com/Anuken/MindustryMods/master/mods.json';

@Injectable()
export class ModCatalogService implements OnApplicationBootstrap {
	private readonly logger = new Logger(ModCatalogService.name);
	private readonly catalogMap = new Map<string, ModInfoDto>();
	private isSyncing = false;

	constructor(private readonly octokitService: OctokitService) {}

	onApplicationBootstrap() {
		void this.syncFromGitHub();
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleDailySync() {
		await this.syncFromGitHub();
	}

	async syncFromGitHub(): Promise<void> {
		if (this.isSyncing) {
			this.logger.warn('GitHub mods sync already in progress, skipping...');
			return;
		}

		this.isSyncing = true;
		this.logger.log('Fetching official Mindustry mods catalog from GitHub...');

		try {
			let mods: MindustryRawMod[] = [];

			try {
				const response = await this.octokitService.rest.repos.getContent({
					owner: 'Anuken',
					repo: 'MindustryMods',
					path: 'mods.json',
				});

				if (!Array.isArray(response.data) && 'content' in response.data && typeof response.data.content === 'string') {
					const jsonString = Buffer.from(response.data.content, 'base64').toString('utf-8');
					const parsed: unknown = JSON.parse(jsonString);
					if (Array.isArray(parsed)) {
						mods = parsed as MindustryRawMod[];
					}
				}
			} catch (octokitError) {
				this.logger.warn('Failed to fetch mods.json via Octokit, attempting direct raw fetch...', octokitError);
			}

			if (mods.length === 0) {
				const res = await fetch(GITHUB_MODS_URL, { signal: AbortSignal.timeout(10000) });
				if (!res.ok) {
					throw new Error(`Failed to fetch mods.json: HTTP ${res.status} ${res.statusText}`);
				}

				const parsed: unknown = await res.json();
				if (!Array.isArray(parsed)) {
					throw new Error('Invalid mods.json format: expected an array');
				}
				mods = parsed as MindustryRawMod[];
			}

			const nextMap = new Map<string, ModInfoDto>();

			for (const item of mods) {
				const repoParts = item.repo ? item.repo.split('/') : [];
				const fallbackId = item.internalName || repoParts[1] || item.name;
				if (!fallbackId) continue;

				const cleanAuthor = item.author ? stripColors(item.author).trim() : null;
				const cleanDescription = item.description ? stripColors(item.description).trim() : null;
				const iconUrl = item.hasIcon && item.repo
					? `https://raw.githubusercontent.com/${item.repo}/HEAD/icon.png`
					: null;

				const dto: ModInfoDto = {
					mod: fallbackId,
					name: item.name || fallbackId,
					repo: item.repo ?? null,
					author: cleanAuthor,
					description: cleanDescription,
					iconUrl,
					stars: typeof item.stars === 'number' ? item.stars : null,
					version: item.version ?? null,
					minGameVersion: item.minGameVersion ?? null,
					lastUpdated: item.lastUpdated ?? null,
				};

				if (item.internalName) {
					nextMap.set(item.internalName.toLowerCase(), dto);
				}
				if (item.repo) {
					nextMap.set(item.repo.toLowerCase(), dto);
					if (repoParts[1]) {
						nextMap.set(repoParts[1].toLowerCase(), dto);
					}
				}
				if (item.name) {
					nextMap.set(item.name.toLowerCase(), dto);
				}
			}

			this.catalogMap.clear();
			for (const [key, value] of nextMap.entries()) {
				this.catalogMap.set(key, value);
			}

			this.logger.log(`Successfully synced ${mods.length} Mindustry mods into catalog cache.`);
		} catch (error) {
			this.logger.error('Failed to sync Mindustry mods catalog:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	getMod(modId?: string | null, modName?: string | null): ModInfoDto {
		const idKey = modId?.toLowerCase();
		const nameKey = modName?.toLowerCase();

		const found = (idKey ? this.catalogMap.get(idKey) : undefined)
			?? (nameKey ? this.catalogMap.get(nameKey) : undefined);

		if (found) {
			return found;
		}

		return {
			mod: modId ?? '',
			name: modName || modId || 'Unknown Mod',
			repo: null,
			author: null,
			description: null,
			iconUrl: null,
			stars: null,
			version: null,
			minGameVersion: null,
			lastUpdated: null,
		};
	}
}
