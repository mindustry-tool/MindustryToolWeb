import { api, hasAccess, SERVER_STATUS_MAP, ServerDto } from '@mindustry-tool/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import useSseQuery from '@/hooks/use-sse-query';
import { useSession } from '@/hooks/use-session';
import { toast } from '@/components/ui/sonner';

export function useServer(id: string, defaultValue?: ServerDto) {
	const userSession = useSession();

	const result = useQuery({
		queryKey: ['servers', id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id,
				},
			}),
		refetchInterval: 1000 * 60,
		refetchOnMount: 'always',
		initialData: defaultValue,
	});

	const queryClient = useQueryClient();
	const createdBy = result.data?.createdBy ?? defaultValue?.createdBy;
	const canSubscribeState = hasAccess(userSession?.session, {
		any: ['server:manage', 'server:dashboard', { authorId: createdBy }],
	});

	useSseQuery({
		queryKey: ['servers-state', id],
		route: api.v4.servers.state,
		params: {
			id,
		},
		enabled: canSubscribeState,
		onNext: (data) => {
			const server: ServerDto | undefined = queryClient.getQueryData(['servers', id]);
			if (server) {
				server.status = SERVER_STATUS_MAP[data.status];
				server.players = data.players.length;
				server.mapName = data.mapName;
				queryClient.setQueryData(['servers', id], server);

				if (SERVER_STATUS_MAP[data.status] !== server.status) {
					toast.success(`Server ${data.status}`);
				}
			}
		},
	});

	return {
		...result,
		isOnline:
			result.data?.status === SERVER_STATUS_MAP['ONLINE'] || result.data?.status === SERVER_STATUS_MAP['PAUSED'],
	};
}
