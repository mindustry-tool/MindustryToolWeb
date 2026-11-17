'use client';

import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { ServerError } from '@/components/server/server-fetch-state';
import { ManageServerAdminForm, ServerAdminSkeleton } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/manage-server-admin-form';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export default function Page({ params }: PageProps<'/[locale]/servers/[id]/admin'>) {
	const { id } = use(params);

	const { data, isError, isLoading, error } = useQuery({
		queryKey: ['servers', id],
		queryFn: () => apiInstance.request(api.v4.servers.get, { params: { id } }),
	});

	if (isLoading)
		return (
			<div className="flex flex-col gap-3 p-4 flex-1 overflow-hidden">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Tran className="text-xl font-semibold" text="server.admin" />
				</div>
				<ServerAdminSkeleton />
			</div>
		);
	if (isError) return <ServerError error={error} />;
	if (!data) return null;

	return (
		<div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
			<ManageServerAdminForm server={data} />
		</div>
	);
}

