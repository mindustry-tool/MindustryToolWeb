import { PageClient } from '@/app/[locale]/(with-navbar)/(everyone)/maps/page.client';
import { apiInstance } from '@/config/api';
import { getTranslation } from '@/i18n/i18n.server';
import { formatTitle } from '@/lib/string.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { api } from '@mindustry-tool/api';
import { Metadata } from 'next';
import environment from '@/config/environment';

export async function generateMetadata({ params }: PageProps<'/[locale]/maps'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['common', 'meta']);

	const title = t('map');

	const [mapsData] = await apiInstance.tryRequest(api.v4.maps.findAll, {
		query: {
			page: 0,
			size: 5,
			verification: 'VERIFIED',
		},
		next: {
			tags: ['maps'],
			revalidate: 60 * 60 * 24,
		},
	});
	const maps = mapsData ?? [];

	return {
		title: formatTitle(title),
		description: t('map-description'),
		openGraph: {
			title: formatTitle(title),
			description: t('map-description'),
			images: maps.map(({ itemId }) => `${environment.url.apiV4}/maps/${itemId}/image.png`),
		},
		alternates: generateAlternate('/maps'),
	};
}

export const revalidate = 3600;

export default async function Page() {
	return <PageClient />;
}
