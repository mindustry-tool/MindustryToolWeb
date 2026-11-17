'use client';

import { api } from '@mindustry-tool/api';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, use } from 'react';
import { ServerError } from '@/components/server/server-fetch-state';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { apiInstance } from '@/config/api';
import { SettingsProvider } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/context';

export default function Layout({ params, children }: LayoutProps<'/[locale]/servers/[id]/settings'>) {
	const { id } = use(params);
	const pathname = usePathname();
	const router = useRouter();

	const { data, isError, isLoading, error } = useQuery({
		queryKey: ['servers', id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id,
				},
			}),
	});

	useEffect(() => {
		if (pathname.endsWith('/settings')) {
			router.replace(`${pathname}/general`);
		}
	}, [pathname, router]);

	if (isLoading || pathname.endsWith('/settings')) {
		return <LoadingSpinner />;
	}

	if (isError) {
		return <ServerError error={error} />;
	}

	if (!data) {
		return <LoadingSpinner />;
	}

	return (
		<SettingsProvider server={data}>
			<Suspense>
				<div className="overflow-y-auto h-full flex-col flex p-4 gap-4 relative">
					{children}
				</div>
			</Suspense>
		</SettingsProvider>
	);
}
