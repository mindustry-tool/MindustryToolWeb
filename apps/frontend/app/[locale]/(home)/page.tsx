import { getTranslation } from '@/i18n/i18n.server';
import HeroSection from './components/hero-section';
import SiteHeader from './components/site-header';
import StatsSection from './components/stats-section';
import RecentSchematics from './components/recent-schematics';
import RecentMaps from './components/recent-maps';
import ShowcaseSection from './components/showcase-section';
import ModSection from './components/mod-section';
import SiteFooter from './components/site-footer';
import './styles.css';
import { apiInstance } from '@/config/api';
import { api } from '@mindustry-tool/api';
import { Metadata } from 'next';
import { formatTitle } from '@/lib/string.utils';
import environment from '@/config/environment';
import { generateAlternate } from '@/lib/i18n.util';
import { cache, Suspense } from 'react';
import StatsFallback from './components/stats-fallback';
import ScrollIndicator from './components/scroll-indicator';
import ClientHomeBackground from './components/client-home-background';
import { CatchError } from '@/components/error/catch-error';

const getSchematics = cache(async () => {
	return await apiInstance.tryRequest(api.v4.schematics.findAll, {
		query: {
			page: 0,
			size: 10,
			verification: 'VERIFIED',
		},
		next: {
			tags: ['schematics'],
			revalidate: 60 * 60 * 24,
		},
	});
});

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['common', 'meta']);

	const title = t('home');

	const [schematicsData] = await getSchematics();
	const schematics = (schematicsData ?? []).slice(0, 10);

	return {
		title: formatTitle(title),
		description: t('home-description'),
		openGraph: {
			title: formatTitle(title),
			description: t('schematic-description'),
			images: schematics.map(({ itemId }) => `${environment.url.apiV4}/schematics/${itemId}/image.png`),
		},
		alternates: generateAlternate('/'),
	};
}

export default async function HomePage() {
	const [schematicsData] = await getSchematics();
	const schematics = (schematicsData ?? []).slice(0, 8);

	const [mapsData] = await apiInstance.tryRequest(api.v4.maps.findAll, {
		query: {
			page: 0,
			size: 8,
			verification: 'VERIFIED',
		},
		next: {
			tags: ['maps'],
			revalidate: 60 * 60 * 24,
		},
	});
	const maps = mapsData ?? [];

	return (
		<div className="relative h-full overflow-y-auto bg-black/95">
			<CatchError logError={false} fallback={null}>
				<ClientHomeBackground />
			</CatchError>
			<ScrollIndicator />
			<div className="relative z-10">
				<SiteHeader />
				<main className="flex flex-col gap-12 pb-20 md:gap-20">
					<HeroSection />
					<Suspense fallback={<StatsFallback />}>
						<StatsSection />
					</Suspense>
					<ModSection />
					<RecentSchematics data={schematics} />
					<RecentMaps data={maps} />
					<ShowcaseSection />
				</main>
				<SiteFooter />
			</div>
		</div>
	);
}
