'use client';

import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import ScrollContainer from '@/components/common/scroll-container';
import { ServerError } from '@/components/server/server-fetch-state';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { ServerEnvList } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-env-list';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { EnvForm } from '@/app/[locale]/(with-navbar)/(everyone)/server-groups/[groupId]/components/manage-group-env-form';

export default function Page({ params }: PageProps<'/[locale]/servers/[id]/environment'>) {
	const { id } = use(params);

	const { data, isError, isLoading, error } = useQuery({
		queryKey: ['servers', id],
		queryFn: () => apiInstance.request(api.v4.servers.get, { params: { id } }),
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <ServerError error={error} />;
	if (!data) return <LoadingSpinner />;

	return (
		<ScrollContainer className="p-4 gap-4 flex-1">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Tran className="text-xl font-semibold" text="server.env" />
				{data.groupId && (
					<Dialog>
						<DialogTrigger asChild>
							<Button className="w-fit ml-auto" variant="default" size="sm">
								<Tran text="server.add-env" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>
								<Tran text="server.add-env" />
							</DialogTitle>
							<VisuallyHidden>
								<DialogDescription />
							</VisuallyHidden>
							<EnvForm groupId={data.groupId} />
						</DialogContent>
					</Dialog>
				)}
			</div>
			<ServerEnvList server={data} />
		</ScrollContainer>
	);
}
