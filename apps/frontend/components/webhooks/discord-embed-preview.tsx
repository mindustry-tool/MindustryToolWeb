'use client';

/* eslint-disable @next/next/no-img-element */

import ColorText from '@/components/common/color-text';
import { ParameterHighlight } from './parameter-highlight';
import { formatWithParameter } from '@mindustry-tool/api';
import { useI18n } from '@/i18n/i18n.client';

export interface DiscordEmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

export interface DiscordEmbedAuthor {
	name?: string;
	url?: string;
	icon_url?: string;
}

export interface DiscordEmbedFooter {
	text?: string;
	icon_url?: string;
}

export interface DiscordEmbed {
	title?: string;
	description?: string;
	url?: string;
	color?: number | string;
	author?: DiscordEmbedAuthor;
	footer?: DiscordEmbedFooter;
	fields?: DiscordEmbedField[];
	timestamp?: string;
}

export function parseEmbedJson(dataStr?: string): DiscordEmbed | null {
	if (!dataStr) return null;
	try {
		const parsed = JSON.parse(dataStr);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed[0];
		}
		if (typeof parsed === 'object' && parsed !== null) {
			if (Array.isArray(parsed.embeds) && parsed.embeds.length > 0) {
				return parsed.embeds[0];
			}
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

export function formatEmbedColor(color?: number | string): string {
	if (color === undefined || color === null) return '#5865F2';
	if (typeof color === 'number') {
		return '#' + color.toString(16).padStart(6, '0');
	}
	if (typeof color === 'string' && color.startsWith('#')) {
		return color;
	}
	if (typeof color === 'string' && !isNaN(Number(color))) {
		return '#' + Number(color).toString(16).padStart(6, '0');
	}
	return '#5865F2';
}

export function DiscordEmbedPreview({
	embed,
	sampleData,
	className = '',
}: {
	embed: DiscordEmbed;
	sampleData?: Record<string, any>;
	className?: string;
}) {
	const borderColor = formatEmbedColor(embed.color);

	const { t } = useI18n();

	const formatText = (text?: string) => {
		if (!text) return '';
		if (!sampleData) return text;
		return formatWithParameter(text, 'data', sampleData);
	};

	return (
		<div
			className={`flex flex-col bg-card/60 border rounded-lg overflow-hidden text-xs shadow-sm transition-all ${className}`}
			style={{ borderLeft: `4px solid ${borderColor}` }}
		>
			<div className="p-3.5 flex flex-col gap-2.5">
				{/* Author */}
				{embed.author?.name && (
					<div className="flex items-center gap-2">
						{embed.author.icon_url && (
							<img
								src={embed.author.icon_url}
								alt={t('author-icon-placeholder')}
								className="w-5 h-5 rounded-full object-cover"
							/>
						)}
						<span className="font-semibold text-foreground text-xs">
							{formatText(embed.author.name)}
						</span>
					</div>
				)}

				{/* Title */}
				{embed.title && (
					<div className="font-bold text-sm text-foreground leading-snug">
						{sampleData ? (
							<ColorText text={formatText(embed.title)} />
						) : (
							<ParameterHighlight text={embed.title} />
						)}
					</div>
				)}

				{/* Description */}
				{embed.description && (
					<div className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
						{sampleData ? (
							<ColorText text={formatText(embed.description)} />
						) : (
							<ParameterHighlight text={embed.description} />
						)}
					</div>
				)}

				{/* Fields Grid */}
				{embed.fields && embed.fields.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
						{embed.fields.map((field, idx) => (
							<div
								key={idx}
								className={`flex flex-col gap-0.5 ${
									field.inline ? 'col-span-1' : 'col-span-full'
								}`}
							>
								<div className="font-semibold text-muted-foreground/90 text-[11px] uppercase tracking-wide">
									{sampleData ? (
										<ColorText text={formatText(field.name)} />
									) : (
										<ParameterHighlight text={field.name} />
									)}
								</div>
								<div className="text-foreground text-xs whitespace-pre-wrap break-all">
									{sampleData ? (
										<ColorText text={formatText(field.value)} />
									) : (
										<ParameterHighlight text={field.value} />
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Footer */}
				{(embed.footer?.text || embed.timestamp) && (
					<div className="flex items-center gap-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
						{embed.footer?.icon_url && (
							<img
								src={embed.footer.icon_url}
								alt={t('footer-icon-placeholder')}
								className="w-4 h-4 rounded-full object-cover"
							/>
						)}
						{embed.footer?.text && <span>{formatText(embed.footer.text)}</span>}
						{embed.footer?.text && embed.timestamp && <span>•</span>}
						{embed.timestamp && (
							<span>{new Date(embed.timestamp).toLocaleString()}</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
