'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import ColorText from '@/components/common/color-text';
import { LocalLink } from '@/components/common/locale-link';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import ErrorMessage from '@/components/error/error-message';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tran } from '@/i18n/tran';

export default function ServerGroupPageLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ groupId: string }>;
}) {
	const { groupId } = use(params);
	const segment = useSelectedLayoutSegment();

	const { data: group, isLoading, isError, error } = useQuery({
		queryKey: ['server-groups', groupId],
		queryFn: () => apiInstance.request(api.v4.serverGroups.get, { params: { groupId } }),
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <ErrorMessage error={error} />;

	return (
		<div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
			<div className="flex items-center justify-between">
				<div className="flex flex-col">
					<ColorText className="text-2xl font-semibold" text={group?.name} />
					{group?.description && (
						<ColorText className="text-sm text-muted-foreground" text={group.description} />
					)}
				</div>
			</div>

			<Separator />

			<Tabs value={segment || 'general'} className="flex-1 flex flex-col min-h-0">
				<TabsList className="w-full mb-2">
					<TabsTrigger value="general" data-state={segment === null ? 'active' : 'inactive'} asChild>
						<LocalLink href={routes.serverGroups.id({ id: groupId }).value}>
							<Tran text="general" />
						</LocalLink>
					</TabsTrigger>
					<TabsTrigger value="admins" data-state={segment === 'admins' ? 'active' : 'inactive'} asChild>
						<LocalLink href={routes.serverGroups.id({ id: groupId }).admins}>
							<Tran text="admins" />
						</LocalLink>
					</TabsTrigger>
					<TabsTrigger value="envs" data-state={segment === 'envs' ? 'active' : 'inactive'} asChild>
						<LocalLink href={routes.serverGroups.id({ id: groupId }).envs}>
							<Tran text="server.envs" />
						</LocalLink>
					</TabsTrigger>
					<TabsTrigger value="webhooks" data-state={segment === 'webhooks' ? 'active' : 'inactive'} asChild>
						<LocalLink href={routes.serverGroups.id({ id: groupId }).webhooks}>
							<Tran text="server.webhooks" />
						</LocalLink>
					</TabsTrigger>
				</TabsList>

				<div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">{children}</div>
			</Tabs>
		</div>
	);
}
