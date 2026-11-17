import type { Metadata } from 'next';

import { Suspense } from 'react';
import { preconnect } from 'react-dom';

import dynamic from 'next/dynamic';
import ClientInit from '@/app/client';
import Redirect from '@/components/common/redirect';
import { Toaster } from '@/components/ui/sonner';
import environment from '@/config/environment';
import { SessionProvider } from '@/context/session.context';

import CookieProvider from '@/cookie/cookie.provider';
import { generateAlternate } from '@/lib/i18n.util';
import { cn } from '@/lib/utils';
import QueryProvider from '@/react-query/query.provider';
import { ThemeProvider } from '@/theme/theme.provider';
import { MessageProvider } from '@/context/message.context';
import { Arimo } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { generateI18nStaticParams, getResources, getT, initServerI18next } from 'next-i18next/server';
import { I18nProvider } from 'next-i18next/client';
import { LOCALES, type Locale } from '@mindustry-tool/api';
import i18nConfig from '@/i18n.config';

import './../globals.css';
import 'server-only';

const DonationDialog = dynamic(() => import('@/components/common/donation-dialog'));

initServerI18next(i18nConfig);

export const metadata: Metadata = {
	metadataBase: new URL(environment.url.base),
	title: 'MindustryTool',
	description: 'A website about mindustry, providing schematics, maps, server hosting, wiki, tutorials and more',
	generator: 'Next.js',
	applicationName: 'MindustryTool',
	keywords: ['Mindustry', 'Schematic', 'Map', 'Mod', 'Post'],
	twitter: {
		site: '@MindustryTool',
		card: 'summary_large_image',
	},
	openGraph: {
		images: 'https://mindustrygame.github.io/1.d25af17a.webp',
		title: 'Mindustry',
		description: 'MindustryTool',
		siteName: 'MindustryTool',
	},
	alternates: generateAlternate('/'),
};

const arimo = Arimo({
	variable: '--font-arimo',
	subsets: ['vietnamese'],
	display: 'swap',
	fallback: ['noto'],
});

export async function generateStaticParams() {
	return generateI18nStaticParams().map(({ lng }) => ({ locale: lng }));
}

export const revalidate = 3600;

export default async function Root({ children, params }: LayoutProps<'/[locale]'>) {
	const { locale: rawLocale } = (await params) ?? {};
	const locale =
		rawLocale && (LOCALES as readonly string[]).includes(rawLocale)
			? (rawLocale as Locale)
			: (i18nConfig.fallbackLng as Locale);

	const { i18n } = await getT(undefined, { lng: locale });
	
    if (locale !== i18nConfig.fallbackLng && !i18n.hasResourceBundle(locale, i18nConfig.defaultNS || 'common')) {
		await i18n.loadLanguages(locale);
	}
    
	const resources = getResources(i18n, undefined, [locale]);

	preconnect('https://api.mindustry-tool.com');

	return (
		<html
			className={cn('h-full w-full bg-background text-foreground antialiased', arimo.className)}
			lang={locale}
			data-color-mode="dark"
			suppressHydrationWarning
		>
			<head>
				<meta name="google" content="notranslate" />
			</head>
			<body className="h-full w-full overflow-hidden bg-linear-to-br gradient:from-black/80 gradient:via-slate-950/90 gradient:to-black/90">
				{process.env.NODE_ENV === 'production' && (
					<>
						{/* eslint-disable-next-line @next/next/next-script-for-ga */}
						<script async src="https://www.googletagmanager.com/gtag/js?id=G-CGKXS6096G" />
						<script
							dangerouslySetInnerHTML={{
								__html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-CGKXS6096G');`,
							}}
						/>
					</>
				)}
				<QueryProvider>
					<SessionProvider>
						<Suspense>
							<I18nProvider language={locale} resources={resources}>
								<MessageProvider>
									<CookieProvider>
										<ThemeProvider attribute="class" defaultTheme="dark" themes={['light', 'dark', 'gradient']}>
											<Suspense>
												<Toaster />
												<ClientInit />
												<Redirect />
												<DonationDialog />
											</Suspense>
											<Suspense>
												<NuqsAdapter>{children}</NuqsAdapter>
											</Suspense>
										</ThemeProvider>
									</CookieProvider>
								</MessageProvider>
							</I18nProvider>
						</Suspense>
					</SessionProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
