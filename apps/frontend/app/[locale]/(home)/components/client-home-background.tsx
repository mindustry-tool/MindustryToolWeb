'use client';

import dynamic from 'next/dynamic';

const HomeBackground = dynamic(() => import('./home-background'), {
	ssr: false,
});

export default function ClientHomeBackground() {
	return <HomeBackground />;
}
