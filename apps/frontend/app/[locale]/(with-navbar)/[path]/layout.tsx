import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
	return [{ path: '@me' }];
}

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ path: string }> }) {
	const { path } = await params;

	if (decodeURIComponent(path) === '@me') {
		return children;
	}

	notFound();
}
