'use client';

import type { ChatMessageDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LocaleDate } from '@/components/common/locale-date';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { cn } from '@/lib/utils';
import type { ChatMessageGroup, ChatPageParam } from '@/app/[locale]/chat/lib/chat.types';
import { formatChatPreview } from '@/app/[locale]/chat/lib/chat.utils';
import { Tran } from '@/i18n/tran';

export function ChatMessageGroupCard({
	activeActionMessageId,
	group,
	messagesById,
	onMessageClick,
	onReply,
	replyToMessage,
}: {
	activeActionMessageId?: string;
	group: ChatMessageGroup;
	messagesById: Map<string, ChatMessageDto>;
	onMessageClick: (messageId: string) => void;
	onReply: (message: ChatMessageDto) => void;
	replyToMessage: ChatMessageDto | null;
}) {
	const lastMessage = group.messages[group.messages.length - 1];

	if (!lastMessage) {
		return null;
	}

	return (
		<div className={cn('flex gap-2', group.isOwn && 'justify-end')}>
			{!group.isOwn && (
				<UserWithIdComponent userId={group.createdBy}>
					<UserAvatar className="self-start" size={32} />
				</UserWithIdComponent>
			)}
			<div className={cn('flex max-w-[90%] flex-col gap-1 sm:max-w-[80%]', group.isOwn && 'items-end')}>
				<div
					className={cn(
						'flex flex-wrap items-center gap-2 text-xs text-muted-foreground',
						group.isOwn && 'justify-end',
					)}
				>
					{!group.isOwn && (
						<>
							<UserWithIdComponent clickable={false} userId={group.createdBy}>
								<UserName className="text-xs h-auto" />
							</UserWithIdComponent>
							<span>{<LocaleDate date={lastMessage.createdAt} />}</span>
						</>
					)}
				</div>
				<div className={cn('relative flex flex-col gap-1', { 'items-end': group.isOwn })}>
					{group.messages.map((message) => {
						const isActionOpen = activeActionMessageId === message.id;
						const isReplying = replyToMessage?.id === message.id;

						return (
							<div
								className={cn('relative flex flex-col gap-1', group.isOwn && 'items-end')}
								key={message.id}
								onClick={(event) => {
									event.stopPropagation();
									onMessageClick(message.id);
								}}
							>
								{message.replyTo && (
									<ChatReplyPreview isOwn={group.isOwn} message={messagesById.get(message.replyTo)} />
								)}
								<div
									className={cn(
										'flex w-fit max-w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-xs transition-colors',
										group.isOwn ? 'border-primary/20 bg-primary text-primary-foreground' : 'bg-card',
										isActionOpen && 'ring-2 ring-ring/40',
										isReplying && 'border-primary ring-2 ring-primary/30',
									)}
									id={message.id}
								>
									<ChatMessageContent content={message.content} />
								</div>
								{isActionOpen && (
									<div className="absolute top-[calc(100%+0.25rem)] z-10 flex items-center gap-1 shadow-sm bg-white/10 backdrop-blur-md rounded-md p-1 border">
										<Button
											className={cn('h-7 gap-1 px-3 text-xs', group.isOwn ? 'right-0' : 'left-0')}
											onClick={(event) => {
												event.stopPropagation();
												onReply(message);
											}}
											variant={isReplying ? 'default' : 'secondary'}
										>
											<Reply className="size-3.5" />
											{isReplying ? <Tran text="chat.replying" /> : <Tran text="chat.reply" />}
										</Button>
										<ClientProtectedElement filter={{ any: ['god', 'chat:delete'] }}>
											<DeleteChatMessageButton message={message} />
										</ClientProtectedElement>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function DeleteChatMessageButton({ message }: { message: ChatMessageDto }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.chats.delete, {
				params: { id: message.id },
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
			queryClient.setQueryData<InfiniteData<ChatMessageDto[], ChatPageParam> | undefined>(
				['chats', message.channelId, 'messages'],
				(query) => {
					if (!query || !query.pages) {
						return query;
					}

					return {
						...query,
						pages: query.pages.map((page) => page.filter((item) => item.id !== message.id)),
					};
				},
			);
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className="h-7 gap-1 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
					onClick={(event) => event.stopPropagation()}
					variant="ghost"
				>
					<Trash2 className="size-3.5" />
					<Tran text="delete" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent onClick={(event) => event.stopPropagation()}>
				<AlertDialogTitle>
					<Tran text="confirm-delete" />
				</AlertDialogTitle>
				<AlertDialogDescription className="space-y-2 text-sm text-muted-foreground">
					<span>
						<Tran text="chat.delete-confirm" />
					</span>
					<span className="block font-mono text-xs text-muted-foreground/80 break-all bg-muted/40 p-2 rounded border border-border/50">
						ID: {message.id}
					</span>
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
							<Tran text="delete" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function ChatMessageContent({ content }: { content: string }) {
	const preview = content.substring(0, 200);
	const isLong = content.length > 200;

	const [isShowAll, setIsShowAll] = useState(false);

	return (
		<p className="whitespace-pre-wrap wrap-break-word text-wrap overflow-x-hidden">
			{isShowAll ? content : preview}
			{isLong && (
				<button
					className="text-primary px-2"
					onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();
						setIsShowAll(!isShowAll);
					}}
				>
					{isShowAll ? <Tran text="chat.show-less" /> : <Tran text="chat.show-more" />}
				</button>
			)}
		</p>
	);
}

function ChatReplyPreview({ isOwn, message }: { isOwn: boolean; message?: ChatMessageDto }) {
	if (!message) {
		return (
			<div
				className={cn(
					'flex max-w-full items-center gap-1 rounded-sm border px-2 py-1 text-xs',
					isOwn
						? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80'
						: 'bg-muted/70 text-muted-foreground',
				)}
			>
				<Reply className="size-3 shrink-0" />
				<span className="truncate">
					<Tran text="chat.original-message-unavailable" />
				</span>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'flex max-w-full items-center gap-1 rounded-sm border px-2 py-1 text-xs',
				isOwn
					? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground'
					: 'bg-muted/70 text-muted-foreground',
			)}
		>
			<UserWithIdComponent clickable={false} userId={message.createdBy}>
				<UserAvatar size={28} />
			</UserWithIdComponent>
			<Reply className="size-3 shrink-0" />
			<span className="truncate">{formatChatPreview(message.content)}</span>
		</div>
	);
}
