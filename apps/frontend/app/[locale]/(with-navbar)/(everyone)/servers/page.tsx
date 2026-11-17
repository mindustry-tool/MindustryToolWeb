import { PageClient } from '@/app/[locale]/(with-navbar)/(everyone)/servers/page.client';
import { getTranslation } from '@/i18n/i18n.server';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps<'/[locale]/servers'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['common', 'meta']);

	const title = t('server');

	return {
		title: formatTitle(title),
		description: t('server-description'),
		openGraph: {
			title: formatTitle(title),
			description: t('server-description'),
		},
		alternates: generateAlternate('/servers'),
	};
}

export default function Page() {
	return <PageClient />;
}
