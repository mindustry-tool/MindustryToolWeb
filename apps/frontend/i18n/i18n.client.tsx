'use client';

import type { Locale } from '@mindustry-tool/api';
import { DEfAULT_I18N_NAMESPACE, LOCALES } from '@mindustry-tool/api';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ReactNode, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { UseTranslationOptions, useTranslation as useTranslationOrg } from 'react-i18next';
import { I18nProvider as BaseI18nProvider, useT } from 'next-i18next/client';
import type { Resource } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';

// Initialize a global i18next instance so react-i18next always has a fallback.
// This suppresses the NO_I18NEXT_INSTANCE warning that fires during Cloudflare Workers
// SSR when client components are rendered outside of an I18nextProvider context tree.
// The I18nProvider below creates a scoped instance that takes precedence via React context.
if (!i18next.isInitialized) {
	i18next.use(initReactI18next).init({
		lng: 'en',
		fallbackLng: 'en',
		resources: {},
		initImmediate: false, // synchronous — safe since there are no async backends
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
	});
}

export const I18nProvider = ({
	children,
	locale,
	resources,
}: {
	locale: string;
	resources?: Resource;
	children: ReactNode;
}) => {
	return (
		<BaseI18nProvider language={locale} resources={resources}>
			{children}
		</BaseI18nProvider>
	);
};

export function useI18n(
	namespace: string | string[] = DEfAULT_I18N_NAMESPACE,
	options?: UseTranslationOptions<undefined>,
) {
	const ns = Array.isArray(namespace) ? namespace[0] : namespace;
	const res = useT(ns);
	const i18n = res?.i18n;
	return useTranslationOrg(namespace, i18n ? { ...options, i18n } : options);
}

export function useLocale(): [Locale, (value: Locale) => void] {
	const { locale } = useParams<{ locale: Locale }>();
	const [, setCookie] = useCookies(['locale']);
	const router = useRouter();
	const pathname = usePathname();

	const setLocale = useCallback(
		(newLocale: Locale) => {
			const href = pathname.startsWith('/') ? pathname : `/${pathname}`;

			const pathnameHasLocale = LOCALES.some((loc) => href.startsWith(`/${loc}/`) || href === `/${loc}`);

			const url = pathnameHasLocale ? `/${newLocale}/${href.slice(4)}` : `/${newLocale}${href}`;

			setCookie('locale', newLocale, { path: '/' });

			router.replace(url);
		},
		[pathname, setCookie, router],
	);

	return [locale, setLocale] as const;
}
