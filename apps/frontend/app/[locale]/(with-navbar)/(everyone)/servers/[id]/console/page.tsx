'use client';

import type { ServerLogDto } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { useQueryClient } from '@tanstack/react-query';
import { Suspense, use, useMemo } from 'react';
import MessageList from '@/components/message/message-list';
import { ServerLogCard } from '@/components/server/server-log-card';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Separator } from '@/components/ui/separator';
import useSse from '@/hooks/use-sse';
import { AlertTriangleIcon } from 'lucide-react';
import { useMessage } from '@/hooks/use-message';
import { PageWrapper } from '@/components/common/page-wrapper';
import { TerminalInput } from './components/terminal-input';

export default function Page({ params }: PageProps<'/[locale]/servers/[id]/console'>) {
	const { id } = use(params);

	return (
		<PageWrapper>
			<Suspense>
				<Terminal serverId={id} />
				<Separator />
				<TerminalInput serverId={id} />
			</Suspense>
		</PageWrapper>
	);
}

function Terminal({ serverId }: { serverId: string }) {
	const queryClient = useQueryClient();
	const { setRenderReason } = useMessage();
	const logsQueryKey = useMemo(() => ['servers', serverId, 'logs'], [serverId]);

	const { state } = useSse({
		route: api.v4.servers.getLogStream,
		params: { id: serverId },
		onEvent: (data) => {
			queryClient.setQueriesData<InfiniteData<ServerLogDto[], unknown> | undefined>(
				{ queryKey: logsQueryKey },
				(query) => {
					if (!query || !query.pages) {
						return undefined;
					}

					const [first, ...rest] = query.pages;

					const newFirst = [data, ...first!];

					setRenderReason('event');

					return {
						...query,
						pages: [newFirst, ...rest],
					} satisfies InfiniteData<ServerLogDto[], unknown>;
				},
			);
		},
	});

	return (
		<MessageList className="w-full" queryKey={logsQueryKey} route={api.v4.servers.getLogs} params={{ id: serverId }}>
			{({ items, ref, isLoading }) => (
				<div
					className="flex h-full w-full flex-col overflow-y-auto bg-black p-2 text-xs text-white sm:text-sm relative"
					ref={ref}
				>
					{isLoading && <LoadingSpinner className="absolute top-4 left-1/2 -translate-x-1/2" />}
					{items.map((item) => (
						<ServerLogCard key={item.id} item={item} />
					))}
					{state === 'disconnected' && (
						<div className="absolute z-10 backdrop-brightness-50 text-sm text-destructive backdrop-blur-sm top-0 left-0 right-0 h-10 flex justify-center items-center">
							<AlertTriangleIcon /> Disconnected
						</div>
					)}
				</div>
			)}
		</MessageList>
	);
}
