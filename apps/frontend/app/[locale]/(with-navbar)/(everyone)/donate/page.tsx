import type { Metadata } from 'next';

import { getTranslation } from '@/i18n/i18n.server';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import DonationPage from './components/donation-page';

export async function generateMetadata({ params }: PageProps<'/[locale]/donate'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['common', 'meta']);

	const title = t('donate', { defaultValue: 'Donate' });
	const description = t('donate-description', {
		defaultValue:
			'Mindustry Tool is free for every player. If you find it useful, a small donation helps cover the cost of running the site.',
	});

	return {
		title: formatTitle(title),
		description,
		openGraph: {
			title: formatTitle(title),
			description,
			images: ['/assets/images/agribank.jpg', '/assets/images/paypal.jpg', '/assets/images/buymeacoffee.svg'],
		},
		alternates: generateAlternate('/donate'),
	};
}

export default function Page() {
	return <DonationPage />;
}
