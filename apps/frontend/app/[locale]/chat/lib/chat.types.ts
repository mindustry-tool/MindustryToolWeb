import type { ChatMessageDto } from '@mindustry-tool/api';

export type ChatPageParam = string | undefined;

export interface ChatChannel {
	id: string;
	name: string;
	lastMessageId?: string | null | undefined;
}

export interface ChatMessageGroup {
	id: string;
	createdBy: string;
	isOwn: boolean;
	messages: ChatMessageDto[];
}

export type ChatLastReadMessageIds = Record<string, string>;
