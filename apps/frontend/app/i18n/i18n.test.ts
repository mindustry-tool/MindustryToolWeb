import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = path.resolve(__dirname, 'locales');
const SOURCE_LOCALE = 'en';

function getDirectories(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

function getJsonFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((dirent) => dirent.isFile() && dirent.name.endsWith('.json'))
		.map((dirent) => dirent.name)
		.sort();
}

function readJsonFile(filePath: string): Record<string, unknown> {
	const content = fs.readFileSync(filePath, 'utf-8');
	return JSON.parse(content);
}

function findDuplicateKeys(filePath: string): string[] {
	const content = fs.readFileSync(filePath, 'utf-8');
	const duplicates: string[] = [];
	const stack: Map<string, number>[] = [new Map()];
	let inString = false;
	let escapeNext = false;
	let keyBuffer = '';
	let expectingKey = false;

	for (let i = 0; i < content.length; i++) {
		const ch = content[i];

		if (escapeNext) {
			escapeNext = false;
			if (inString) keyBuffer += ch;
			continue;
		}

		if (ch === '\\' && inString) {
			escapeNext = true;
			keyBuffer += ch;
			continue;
		}

		if (ch === '"') {
			if (inString) {
				inString = false;
				if (expectingKey) {
					const currentMap = stack[stack.length - 1];
					if (currentMap) {
						const count = (currentMap.get(keyBuffer) || 0) + 1;
						currentMap.set(keyBuffer, count);
						if (count === 2) {
							const path = stack.length > 1
								? Array.from({ length: stack.length - 1 }, (_, i) => [...(stack[i]?.keys() ?? [])][0]).join('.') + '.' + keyBuffer
								: keyBuffer;
							duplicates.push(path);
						}
					}
					expectingKey = false;
				}
				keyBuffer = '';
			} else {
				inString = true;
				if (content[i - 1] === ':' || (i > 0 && content.substring(0, i).match(/[{,]\s*$/))) {
					expectingKey = true;
				}
			}
			continue;
		}

		if (inString) {
			keyBuffer += ch;
			continue;
		}

		if (ch === '{') {
			stack.push(new Map());
		} else if (ch === '}') {
			if (stack.length > 1) stack.pop();
		}
	}

	return duplicates;
}

function flattenKeys(
	obj: Record<string, unknown>,
	prefix = '',
): Map<string, unknown> {
	const result = new Map<string, unknown>();

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			const nested = flattenKeys(
				value as Record<string, unknown>,
				fullKey,
			);
			for (const [nestedKey, nestedVal] of nested.entries()) {
				result.set(nestedKey, nestedVal);
			}
		} else {
			result.set(fullKey, value);
		}
	}

	return result;
}

// Keys where the value is an invariant technical identifier, brand name, protocol, or raw variable
const TECHNICAL_TERMS_EXCLUSIONS = new Set([
	'about.json:discord',
	'about.json:github',
	'mod.json:json-badge',
	'donate.json:agribank',
	'donate.json:paypal',
	'donate.json:buymeacoffee',
	'donate.json:paypal-email',
	'home.json:mod-title',
	'sitemap.json:xml',
	'notification.json:admin.linkPlaceholder',
	'notification.json:codes.system.announcement.title',
	'notification.json:codes.system.announcement.description',
	'notification.json:codes.system.maintenance.title',
	'notification.json:codes.system.maintenance.description',
	'logic.json:statement-outx',
	'logic.json:statement-outy',
	'logic.json:node-group-io',
	'logic.json:statement-g',
	'logic.json:node-ubind',
	'logic.json:statement-r',
	'logic.json:statement-a',
	'logic.json:statement-b',
	'logic.json:node-ucontrol',
	'logic.json:node-radar',
	'logic.json:node-ulocate',
	'logic.json:node-uradar',
	'logic.json:statement-y',
	'logic.json:statement-x',
	'generator-canvas.json:strength-suffix',
	'moderation.json:github-url-placeholder',
	'server.json:address-placeholder',
	'moderation.json:preset-nsfw',
	'common.json:youtube-url-placeholder',
	'common.json:sort-occurrences',
	'common.json:diagnostics',
]);

const sourceLocaleDir = path.join(LOCALES_DIR, SOURCE_LOCALE);
const sourceFiles = getJsonFiles(sourceLocaleDir);
const allLocales = getDirectories(LOCALES_DIR);
const targetLocales = allLocales.filter((locale) => locale !== SOURCE_LOCALE);

describe('i18n translation parity and accuracy', () => {
	it('should find the source "en" locale directory with translation files', () => {
		expect(
			fs.existsSync(sourceLocaleDir),
			`Source locale directory not found: ${sourceLocaleDir}`,
		).toBe(true);
		expect(
			sourceFiles.length,
			'Source locale directory has no JSON files',
		).toBeGreaterThan(0);
	});

	for (const fileName of sourceFiles) {
		it(`source file: ${fileName} should not contain duplicate keys`, () => {
			const filePath = path.join(sourceLocaleDir, fileName);
			const duplicates = findDuplicateKeys(filePath);
			if (duplicates.length > 0) {
				throw new Error(
					`[DUPLICATE KEYS] ${duplicates.length} duplicate key(s) found in "${SOURCE_LOCALE}/${fileName}":\n` +
						duplicates.map((k) => `  = "${k}"`).join('\n') +
						`\nAction required: Remove duplicate keys. JSON.parse silently overwrites the first value with the last.`,
				);
			}
		});
	}

	for (const targetLocale of targetLocales) {
		describe(`locale: ${targetLocale}`, () => {
			const targetLocaleDir = path.join(LOCALES_DIR, targetLocale);

			it('should have all translation files matching the source locale', () => {
				const targetFiles = getJsonFiles(targetLocaleDir);
				const missingFiles = sourceFiles.filter(
					(file) => !targetFiles.includes(file),
				);
				const extraFiles = targetFiles.filter(
					(file) => !sourceFiles.includes(file),
				);

				const errors: string[] = [];
				if (missingFiles.length > 0) {
					errors.push(
						`Missing translation files in "${targetLocale}":\n  - ${missingFiles.join('\n  - ')}`,
					);
				}
				if (extraFiles.length > 0) {
					errors.push(
						`Extra translation files found in "${targetLocale}" (not present in source "${SOURCE_LOCALE}"):\n  - ${extraFiles.join('\n  - ')}`,
					);
				}

				if (errors.length > 0) {
					throw new Error(errors.join('\n\n'));
				}
			});

			for (const fileName of sourceFiles) {
				const sourceFilePath = path.join(sourceLocaleDir, fileName);
				const targetFilePath = path.join(targetLocaleDir, fileName);

				it(`file: ${fileName} should match keys and have translated values`, () => {
					if (!fs.existsSync(targetFilePath)) {
						throw new Error(
							`Translation file "${targetLocale}/${fileName}" does not exist. Please add it to match "${SOURCE_LOCALE}/${fileName}".`,
						);
					}

					let sourceJson: Record<string, unknown>;
					let targetJson: Record<string, unknown>;

					try {
						sourceJson = readJsonFile(sourceFilePath);
					} catch (err) {
						throw new Error(
							`Failed to parse source JSON "${SOURCE_LOCALE}/${fileName}": ${(err as Error).message}`,
						);
					}

					try {
						targetJson = readJsonFile(targetFilePath);
					} catch (err) {
						throw new Error(
							`Failed to parse target JSON "${targetLocale}/${fileName}": ${(err as Error).message}`,
						);
					}

					const sourceMap = flattenKeys(sourceJson);
					const targetMap = flattenKeys(targetJson);

					const missingKeys: string[] = [];
					const extraKeys: string[] = [];
					const untranslatedKeys: Array<{ key: string; value: string }> = [];
					const rawKeyAsValueKeys: Array<{ key: string; value: string }> = [];

					for (const [key, sourceValue] of sourceMap.entries()) {
						if (!targetMap.has(key)) {
							missingKeys.push(key);
							continue;
						}

						const targetValue = targetMap.get(key);
						const entryIdentifier = `${fileName}:${key}`;

						if (
							!TECHNICAL_TERMS_EXCLUSIONS.has(entryIdentifier) &&
							typeof sourceValue === 'string' &&
							typeof targetValue === 'string'
						) {
							const trimmedSource = sourceValue.trim();
							const trimmedTarget = targetValue.trim();

							if (
								trimmedSource !== '' &&
								trimmedSource === trimmedTarget
							) {
								untranslatedKeys.push({
									key,
									value: trimmedTarget,
								});
							} else if (
								trimmedTarget !== '' &&
								trimmedSource !== key &&
								trimmedTarget === key
							) {
								rawKeyAsValueKeys.push({
									key,
									value: trimmedTarget,
								});
							}
						}
					}

					for (const key of targetMap.keys()) {
						if (!sourceMap.has(key)) {
							extraKeys.push(key);
						}
					}

					const errorMessages: string[] = [];

					if (missingKeys.length > 0) {
						errorMessages.push(
							`[MISSING KEYS] ${missingKeys.length} key(s) missing in "${targetLocale}/${fileName}":\n` +
								missingKeys.map((k) => `  + "${k}"`).join('\n') +
								`\nAction required: Add these keys and properly translate their values.`,
						);
					}

					if (extraKeys.length > 0) {
						errorMessages.push(
							`[EXTRA KEYS] ${extraKeys.length} obsolete/extra key(s) in "${targetLocale}/${fileName}" not found in "${SOURCE_LOCALE}/${fileName}":\n` +
								extraKeys.map((k) => `  - "${k}"`).join('\n') +
								`\nAction required: Remove these extra keys.`,
						);
					}

					if (untranslatedKeys.length > 0) {
						errorMessages.push(
							`[UNTRANSLATED KEYS] ${untranslatedKeys.length} key(s) in "${targetLocale}/${fileName}" have identical values to English source "${SOURCE_LOCALE}":\n` +
								untranslatedKeys
									.map(
										({ key, value }) =>
											`  = "${key}": "${value}"`,
									)
									.join('\n') +
								`\nAction required: Properly translate these values for "${targetLocale}" instead of copying English.`,
						);
					}

					if (rawKeyAsValueKeys.length > 0) {
						errorMessages.push(
							`[RAW KEY AS VALUE] ${rawKeyAsValueKeys.length} key(s) in "${targetLocale}/${fileName}" have raw key names as translation values:\n` +
								rawKeyAsValueKeys
									.map(
										({ key, value }) =>
											`  = "${key}": "${value}"`,
									)
									.join('\n') +
								`\nAction required: Properly translate these values for "${targetLocale}" instead of leaving raw key placeholders.`,
						);
					}

					if (errorMessages.length > 0) {
						throw new Error(
							`i18n check failed for "${targetLocale}/${fileName}":\n\n` +
								errorMessages.join('\n\n'),
						);
					}
				});
			}
		});
	}

	describe('untranslated key placeholders check', () => {
		const tagKeysToCheck = [
			'position',
			'duplicate',
			'icon-description',
			'icon',
			'name',
		];

		const serverKeysToCheck = [
			'my-servers-fleet',
		];

		for (const targetLocale of targetLocales) {
			it(`locale "${targetLocale}" should have properly translated values in tags.json, not raw key names or untranslated English`, () => {
				const tagsTarget = readJsonFile(path.join(LOCALES_DIR, targetLocale, 'tags.json'));
				const tagsSource = readJsonFile(path.join(LOCALES_DIR, SOURCE_LOCALE, 'tags.json'));

				for (const key of tagKeysToCheck) {
					const targetVal = tagsTarget[key];
					const sourceVal = tagsSource[key];

					expect(targetVal, `Key "${key}" is missing in "${targetLocale}/tags.json"`).toBeDefined();
					expect(typeof targetVal).toBe('string');
					expect(
						targetVal,
						`Key "${key}" in "${targetLocale}/tags.json" must not be equal to its raw key name`,
					).not.toBe(key);
					expect(
						targetVal,
						`Key "${key}" in "${targetLocale}/tags.json" must not be equal to English source "${sourceVal}"`,
					).not.toBe(sourceVal);
				}
			});

			it(`locale "${targetLocale}" should have properly translated values in server.json for fleet keys, not raw key names or untranslated English`, () => {
				const serverTarget = readJsonFile(path.join(LOCALES_DIR, targetLocale, 'server.json'));
				const serverSource = readJsonFile(path.join(LOCALES_DIR, SOURCE_LOCALE, 'server.json'));

				for (const key of serverKeysToCheck) {
					const targetVal = serverTarget[key];
					const sourceVal = serverSource[key];

					expect(targetVal, `Key "${key}" is missing in "${targetLocale}/server.json"`).toBeDefined();
					expect(typeof targetVal).toBe('string');
					expect(
						targetVal,
						`Key "${key}" in "${targetLocale}/server.json" must not be equal to its raw key name`,
					).not.toBe(key);
					expect(
						targetVal,
						`Key "${key}" in "${targetLocale}/server.json" must not be equal to English source "${sourceVal}"`,
					).not.toBe(sourceVal);
				}
			});

			it(`locale "${targetLocale}" common.json should not contain namespaced dotted keys`, () => {
				const commonTarget = readJsonFile(path.join(LOCALES_DIR, targetLocale, 'common.json'));
				const dottedKeys = Object.keys(commonTarget).filter((k) => k.includes('.'));
				expect(
					dottedKeys,
					`Found namespaced dotted keys in "${targetLocale}/common.json": ${dottedKeys.join(', ')}. Move them to their proper namespace files!`,
				).toEqual([]);
			});
		}
	});
});
