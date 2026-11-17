import { PageClient } from '@/app/[locale]/new-post/page.client';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
	robots: {
		index: false,
	},
};

export default function Page() {
	return (
		<Suspense>
			<PageClient />
		</Suspense>
	);
}
