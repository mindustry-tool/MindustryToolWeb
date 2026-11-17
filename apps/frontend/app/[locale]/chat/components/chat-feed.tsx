'use client';

import type { ChatMessageDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangleIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v7 } from 'uuid';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import ScrollContainer from '@/components/common/scroll-container';
import { apiInstance } from '@/config/api';
import { useMessage } from '@/hooks/use-message';
import { useSession } from '@/hooks/use-session';
import useSse from '@/hooks/use-sse';
import { isEndReached } from '@/lib/utils';
import type { ChatChannel, ChatPageParam } from '@/app/[locale]/chat/lib/chat.types';
import { createMessageGroups } from '@/app/[locale]/chat/lib/chat.utils';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';
import { ChatMessageGroupCard } from '@/app/[locale]/chat/components/chat-message-group';
import { Tran } from '@/i18n/tran';

export function ChatFeed() {
	const queryClient = useQueryClient();
	const { session } = useSession();
	const { renderReason, setRenderReason } = useMessage();
	const { activeChannelId, cancelReply, markLastReadMessageId, replyToMessage, setReplyToMessage } = useChatPage();
	const listRef = useRef<HTMLDivElement>(null);
	const previousHeightRef = useRef(0);
	const shouldStickToBottomRef = useRef(true);
	const [activeActionMessageId, setActiveActionMessageId] = useState<string>();

	const channelId = activeChannelId ?? '';
	const queryKey = useMemo(() => ['chats', channelId, 'messages'], [channelId]);

	const { data, error, isError, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
		queryKey,
		initialPageParam: undefined as ChatPageParam,
		queryFn: ({ pageParam }) => {
			setRenderReason('fetch');

			return apiInstance.request(api.v4.chats.fetch, {
				query: {
					channelId,
					cursor: pageParam,
				},
			});
		},
		getNextPageParam: (lastPage) => {
			if (!lastPage || lastPage.length < 50) {
				return undefined;
			}

			return lastPage.at(-1)?.id;
		},
		enabled: Boolean(activeChannelId),
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		staleTime: 1000 * 60,
	});

	const items = useMemo(() => data?.pages.flatMap((page) => page).toReversed() ?? [], [data]);
	const groups = useMemo(() => createMessageGroups(items, session?.id), [items, session?.id]);
	const messagesById = useMemo(() => new Map(items.map((message) => [message.id, message])), [items]);
	const lastMessageId = items.at(-1)?.id;
	const [chatId] = useLocalStorage('chat-id', v7());

	const { state } = useSse({
		route: api.v4.chats.stream,
		headers: {
			'x-chat-id': chatId,
		},
		onEvent: (event) => {
			if (event.type === 'delete') {
				const deleted = event.data;

				if (deleted.lastMessageId !== undefined) {
					queryClient.setQueryData<ChatChannel[] | undefined>(['chats', 'channels'], (currentValue) =>
						currentValue?.map((channel) =>
							channel.id === deleted.channelId
								? { ...channel, lastMessageId: deleted.lastMessageId ?? null }
								: channel,
						),
					);
				}

				if (replyToMessage?.id === deleted.id) {
					cancelReply();
				}

				if (activeActionMessageId === deleted.id) {
					setActiveActionMessageId(undefined);
				}

				queryClient.setQueryData<InfiniteData<ChatMessageDto[], ChatPageParam> | undefined>(
					['chats', deleted.channelId, 'messages'],
					(query) => {
						if (!query || !query.pages) {
							return query;
						}

						return {
							...query,
							pages: query.pages.map((page) => page.filter((item) => item.id !== deleted.id)),
						};
					},
				);

				return;
			}

			const nextMessage = event.data;

			queryClient.setQueryData<ChatChannel[] | undefined>(['chats', 'channels'], (currentValue) =>
				currentValue?.map((channel) =>
					channel.id === nextMessage.channelId ? { ...channel, lastMessageId: nextMessage.id } : channel,
				),
			);

			if (nextMessage.channelId !== channelId) {
				return;
			}

			queryClient.setQueryData<InfiniteData<ChatMessageDto[], ChatPageParam> | undefined>(queryKey, (query) => {
				if (!query || !query.pages) {
					return query;
				}

				const firstPage = query.pages[0] ?? [];
				const restPages = query.pages.slice(1);

				if (firstPage.some((item) => item.id === nextMessage.id)) {
					return query;
				}

				setRenderReason('event');

				return {
					...query,
					pages: [[nextMessage, ...firstPage], ...restPages],
				};
			});
		},
	});

	useEffect(() => {
		if (!activeChannelId || !lastMessageId) {
			return;
		}

		markLastReadMessageId(activeChannelId, lastMessageId);
	}, [activeChannelId, lastMessageId, markLastReadMessageId]);

	useLayoutEffect(() => {
		const element = listRef.current;

		if (!element) {
			return;
		}

		if (renderReason.current === 'event') {
			if (shouldStickToBottomRef.current) {
				element.scrollTo({
					top: element.scrollHeight,
					behavior: 'smooth',
				});
			}
		} else if (previousHeightRef.current > 0 && element.scrollHeight > previousHeightRef.current) {
			element.scrollTop = element.scrollHeight - previousHeightRef.current;
		} else {
			element.scrollTop = element.scrollHeight;
		}

		previousHeightRef.current = element.scrollHeight;
	}, [channelId, items.length, renderReason]);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<div className="relative min-h-0 flex-1 overflow-hidden rounded-md border bg-background">
			<ScrollContainer
				id={channelId}
				className="flex h-full min-h-80 flex-col overflow-y-auto p-2 sm:p-3"
				ref={listRef}
				onClick={() => setActiveActionMessageId(undefined)}
				onScroll={(event) => {
					const element = event.currentTarget;

					shouldStickToBottomRef.current = isEndReached(element, 200);

					if (element.scrollTop > Math.min(500, element.scrollHeight / 2) || !hasNextPage || isFetchingNextPage) {
						return;
					}

					previousHeightRef.current = element.scrollHeight;
					fetchNextPage();
				}}
			>
				{isFetchingNextPage && <LoadingSpinner />}
				<div className="mt-auto flex flex-col gap-3">
					{isLoading && <LoadingSpinner />}
					{!isLoading && groups.length === 0 && (
						<div className="flex h-full items-center justify-center text-sm text-muted-foreground"><Tran text="chat.no-message-yet" /></div>
					)}
					{groups.map((group) => (
						<ChatMessageGroupCard
							key={group.id}
							activeActionMessageId={activeActionMessageId}
							group={group}
							messagesById={messagesById}
							onMessageClick={(messageId) =>
								setActiveActionMessageId((currentValue) => (currentValue === messageId ? undefined : messageId))
							}
							onReply={(message) => {
								setReplyToMessage(message);
								setActiveActionMessageId(undefined);
							}}
							replyToMessage={replyToMessage}
						/>
					))}
				</div>
			</ScrollContainer>
			{state === 'disconnected' && (
				<div className="absolute left-0 right-0 top-0 z-10 flex h-10 items-center justify-center gap-2 backdrop-blur-sm backdrop-brightness-50">
					<AlertTriangleIcon className="size-4 text-destructive" />
					<span className="text-sm text-destructive"><Tran text="chat.disconnected" /></span>
				</div>
			)}
		</div>
	);
}
