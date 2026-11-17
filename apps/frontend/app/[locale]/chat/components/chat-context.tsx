'use client';

import type { ChatMessageDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { apiInstance } from '@/config/api';
import type { ChatChannel, ChatLastReadMessageIds } from '@/app/[locale]/chat/lib/chat.types';
import { deserializeChatLastReadMessageIds } from '@/app/[locale]/chat/lib/chat.utils';

interface ChatPageContextValue {
	activeChannelId?: string;
	channels?: ChatChannel[];
	unreadChannelIds: Set<string>;
	replyToMessage: ChatMessageDto | null;
	selectChannel: (channelId: string) => void;
	setReplyToMessage: (message: ChatMessageDto) => void;
	cancelReply: () => void;
	markLastReadMessageId: (channelId: string, lastReadMessageId: string) => void;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
}

const ChatPageContext = createContext<ChatPageContextValue | undefined>(undefined);

export function ChatPageProvider({ children }: { children: ReactNode }) {
	const [selectedChannelId, setSelectedChannelId] = useLocalStorage<string | undefined>(
		'chat-selected-channel-id',
		undefined,
	);
	const [replyToMessage, setReplyToMessage] = useState<ChatMessageDto | null>(null);
	const [lastReadMessageIds, setLastReadMessageIds] = useLocalStorage<ChatLastReadMessageIds>(
		'chat-last-read-message-ids',
		{},
		{
			deserializer: deserializeChatLastReadMessageIds,
			serializer: JSON.stringify,
		},
	);

	const {
		data: channels,
		error,
		isError,
		isLoading,
	} = useQuery({
		queryKey: ['chats', 'channels'],
		queryFn: () => apiInstance.request(api.v4.chats.channels, {}),
	});

	const activeChannelId = selectedChannelId ?? channels?.[0]?.id;

	const unreadChannelIds = useMemo(
		() =>
			new Set(
				channels
					?.filter(
						(channel) => Boolean(channel.lastMessageId) && channel.lastMessageId !== lastReadMessageIds[channel.id],
					)
					.map((channel) => channel.id) ?? [],
			),
		[channels, lastReadMessageIds],
	);

	const markLastReadMessageId = useCallback(
		(channelId: string, lastReadMessageId: string) => {
			setLastReadMessageIds((currentValue) => {
				const savedLastReadMessageId = currentValue[channelId];
				if (savedLastReadMessageId === lastReadMessageId) {
					return currentValue;
				}

				if (savedLastReadMessageId && savedLastReadMessageId >= lastReadMessageId) {
					return currentValue;
				}

				return {
					...currentValue,
					[channelId]: lastReadMessageId,
				};
			});
		},
		[setLastReadMessageIds],
	);

	useEffect(() => {
		if (!activeChannelId || !channels) {
			return;
		}

		const activeChannel = channels.find((channel) => channel.id === activeChannelId);
		if (activeChannel?.lastMessageId) {
			markLastReadMessageId(activeChannel.id, activeChannel.lastMessageId);
		}
	}, [activeChannelId, channels, markLastReadMessageId]);

	const selectChannel = useCallback(
		(channelId: string) => {
			setSelectedChannelId(channelId);
			setReplyToMessage(null);
		},
		[setSelectedChannelId],
	);

	const cancelReply = useCallback(() => setReplyToMessage(null), []);

	const value = useMemo<ChatPageContextValue>(
		() => ({
			activeChannelId,
			channels,
			unreadChannelIds,
			replyToMessage,
			selectChannel,
			setReplyToMessage,
			cancelReply,
			markLastReadMessageId,
			isLoading,
			isError,
			error,
		}),
		[
			activeChannelId,
			channels,
			unreadChannelIds,
			replyToMessage,
			selectChannel,
			cancelReply,
			markLastReadMessageId,
			isLoading,
			isError,
			error,
		],
	);

	return <ChatPageContext.Provider value={value}>{children}</ChatPageContext.Provider>;
}

export function useChatPage() {
	const context = useContext(ChatPageContext);
	if (!context) {
		throw new Error('useChatPage must be used within ChatPageProvider');
	}
	return context;
}
