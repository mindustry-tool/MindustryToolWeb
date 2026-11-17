import type { Locale } from '@mindustry-tool/api';
import { DEfAULT_LOCALE, LOCALES } from '@mindustry-tool/api';
import { getT } from 'next-i18next/server';
import { cache } from 'react';

export const getTranslation = cache(
	async (locale: string, namespace: string | string[] = 'common', options: { keyPrefix?: string } = {}) => {
		const language: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEfAULT_LOCALE;
		const ns = Array.isArray(namespace) ? namespace.map((n) => n.toLowerCase()) : namespace.toLowerCase();

		const { i18n } = await getT(ns, { lng: language });
		const firstNs = Array.isArray(ns) ? ns[0] : ns;
		if (language !== DEfAULT_LOCALE && !i18n.hasResourceBundle(language, firstNs || 'common')) {
			await i18n.loadLanguages(language);
		}

		return {
			t: (key: string, opts?: Record<string, unknown>) => {
				const fixedT = i18n.getFixedT(language, ns, options.keyPrefix);
				return fixedT(key.toLowerCase(), opts) as string;
			},
			i18n,
		};
	},
);
