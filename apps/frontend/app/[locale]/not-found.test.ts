import { describe, expect, it } from 'vitest';
import i18nConfig from '@/i18n.config';
import { LOCALES } from '@mindustry-tool/api';

describe('i18nConfig.resourceLoader resilience', () => {
	it('returns empty object when lng is undefined or not a string', async () => {
		// @ts-expect-error testing undefined input
		const resultUndefined = await i18nConfig.resourceLoader?.(undefined, 'common');
		expect(resultUndefined).toEqual({});

		// @ts-expect-error testing null input
		const resultNull = await i18nConfig.resourceLoader?.(null, 'common');
		expect(resultNull).toEqual({});

		// @ts-expect-error testing invalid type
		const resultNumber = await i18nConfig.resourceLoader?.(123, 'common');
		expect(resultNumber).toEqual({});
	});

	it('returns empty object when lng is not in supported LOCALES', async () => {
		const resultInvalid = await i18nConfig.resourceLoader?.('invalid-locale', 'common');
		expect(resultInvalid).toEqual({});
	});

	it('loads valid translation bundle for supported locale', async () => {
		const resultValid = await i18nConfig.resourceLoader?.('en', 'common');
		expect(resultValid).toBeDefined();
		expect(typeof resultValid).toBe('object');
	});
});

describe('Locale parameter normalization logic', () => {
	function normalizeLocale(rawLocale: string | undefined): string {
		return rawLocale && (LOCALES as readonly string[]).includes(rawLocale)
			? rawLocale
			: (i18nConfig.fallbackLng as string);
	}

	it('defaults to fallbackLng when rawLocale is undefined or empty', () => {
		expect(normalizeLocale(undefined)).toBe('en');
		expect(normalizeLocale('')).toBe('en');
	});

	it('defaults to fallbackLng when rawLocale is not supported', () => {
		expect(normalizeLocale('unknown')).toBe('en');
		expect(normalizeLocale('.github')).toBe('en');
	});

	it('preserves valid supported locale', () => {
		expect(normalizeLocale('en')).toBe('en');
		expect(normalizeLocale('vi')).toBe('vi');
		expect(normalizeLocale('jp')).toBe('jp');
	});
});
