import { PageClient } from '@/app/[locale]/(with-navbar)/(everyone)/schematics/page.client';
import { apiInstance } from '@/config/api';
import { getTranslation } from '@/i18n/i18n.server';
import { formatTitle } from '@/lib/string.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { api } from '@mindustry-tool/api';
import { Metadata } from 'next';
import environment from '@/config/environment';

import 'server-only';

export async function generateMetadata({ params }: PageProps<'/[locale]/schematics'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['common', 'meta']);

	const title = t('schematic');

	const [schematicsData] = await apiInstance.tryRequest(api.v4.schematics.findAll, {
		query: {
			page: 0,
			size: 5,
			verification: 'VERIFIED',
		},
		next: {
			tags: ['schematics'],
			revalidate: 60 * 60 * 24,
		},
	});
	const schematics = schematicsData ?? [];

	return {
		title: formatTitle(title),
		description: t('schematic-description'),
		openGraph: {
			title: formatTitle(title),
			description: t('schematic-description'),
			images: schematics.map(({ itemId }) => `${environment.url.apiV4}/schematics/${itemId}/image.png`),
		},
		alternates: generateAlternate('/schematics'),
	};
}

export const revalidate = 3600;

export default async function Page() {
	return <PageClient />;
}
