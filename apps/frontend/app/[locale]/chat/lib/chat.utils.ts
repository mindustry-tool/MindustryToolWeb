import type { ChatMessageDto } from '@mindustry-tool/api';
import type { ChatLastReadMessageIds, ChatMessageGroup } from '@/app/[locale]/chat/lib/chat.types';

export function createMessageGroups(messages: ChatMessageDto[], currentUserId?: string) {
	return messages.reduce<ChatMessageGroup[]>((groups, message) => {
		const lastGroup = groups.at(-1);

		if (lastGroup && lastGroup.createdBy === message.createdBy) {
			lastGroup.messages.push(message);
			return groups;
		}

		groups.push({
			id: message.id,
			createdBy: message.createdBy,
			isOwn: currentUserId === message.createdBy,
			messages: [message],
		});

		return groups;
	}, []);
}

export function formatChatPreview(content: string) {
	return content.replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function deserializeChatLastReadMessageIds(value: string) {
	try {
		const parsedValue = JSON.parse(value);

		if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
			return {};
		}

		return Object.entries(parsedValue).reduce<ChatLastReadMessageIds>((accumulator, [channelId, lastReadMessageId]) => {
			if (typeof channelId === 'string' && typeof lastReadMessageId === 'string') {
				accumulator[channelId] = lastReadMessageId;
			}

			return accumulator;
		}, {});
	} catch {
		return {};
	}
}
