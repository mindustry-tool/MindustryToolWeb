'use client';

import { api } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import ScrollContainer from '@/components/common/scroll-container';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { RevealValue } from '@/components/common/reveal-value';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export function ServerEnvList({ server }: { server: ServerDto }) {
	const { data: groupEnvs } = useQuery({
		queryKey: ['server-groups', server.groupId, 'envs'],
		queryFn: () =>
			apiInstance.request(api.v4.serverGroups.envs.list, { params: { groupId: server.groupId! } }),
		enabled: !!server.groupId,
	});

	const { data: resolved } = useQuery({
		queryKey: ['servers', server.id, 'resolved-config'],
		queryFn: () => apiInstance.request(api.v4.servers.getResolvedConfig, { params: { id: server.id } }),
	});

	const serverEnvs = resolved?.envs ?? {};

	return (
		<ScrollContainer className="flex-1 gap-2">
			{groupEnvs && groupEnvs.length > 0 && (
				<div className="flex flex-col gap-1">
					{groupEnvs.map((env) => (
						<div
							key={env.id}
							className="flex items-center gap-2 rounded-md border border-dashed bg-card/40 px-2 py-1 opacity-60"
						>
							<span className="font-mono text-sm font-semibold">{env.name}</span>
							<span className="text-muted-foreground">=</span>
							<RevealValue value={env.value} />
							<LocalLink href={routes.serverGroups.id({ id: server.groupId! }).envs} className="ml-auto">
								<Badge variant="outline" className="text-[10px] hover:border-primary cursor-pointer transition-colors">
									<Tran text="group" />
								</Badge>
							</LocalLink>
						</div>
					))}
				</div>
			)}
			{Object.keys(serverEnvs).length > 0 && (
				<div className="flex flex-col gap-1">
					{groupEnvs && groupEnvs.length > 0 && (
						<Tran
							className="text-xs text-muted-foreground font-semibold tracking-wide"
							text="effective"
						/>
					)}
					{Object.entries(serverEnvs).map(([name, value]) => (
						<div
							key={name}
							className="flex items-center gap-2 rounded-md border bg-card/50 px-2 py-1"
						>
							<span className="font-mono text-sm font-semibold">{name}</span>
							<span className="text-muted-foreground">=</span>
							<RevealValue value={String(value)} />
						</div>
					))}
				</div>
			)}
			{(!server.groupId || !groupEnvs || groupEnvs.length === 0) && Object.keys(serverEnvs).length === 0 && (
				<div className="text-sm text-muted-foreground py-2">
					<Tran text="server.no-envs" />
				</div>
			)}
		</ScrollContainer>
	);
}
