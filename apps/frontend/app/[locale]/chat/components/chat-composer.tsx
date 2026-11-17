'use client';

import type { ChatMessageDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Reply, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupTextarea,
} from '@/components/ui/input-group';
import { apiInstance } from '@/config/api';
import { useMessage } from '@/hooks/use-message';
import { useSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';
import type { ChatChannel, ChatPageParam } from '@/app/[locale]/chat/lib/chat.types';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

const MAX_TEXT_LENGTH = 1028;

export function ChatComposer() {
	const queryClient = useQueryClient();
	const { setRenderReason } = useMessage();
	const { session, state } = useSession();
	const { activeChannelId, replyToMessage, cancelReply } = useChatPage();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const { t } = useI18n('chat');

	const [content, setContent] = useState('');

	const isAuthenticated = state === 'authenticated' && Boolean(session);
	const isContentValid = content.trim().length > 0 && content.length <= MAX_TEXT_LENGTH;

	const channelId = activeChannelId ?? '';
	const queryKey = useMemo(() => ['chats', channelId, 'messages'], [channelId]);

	useEffect(() => {
		if (replyToMessage) {
			inputRef.current?.focus();
		}
	}, [replyToMessage]);

	const { mutate, isPending } = useMutation({
		mutationFn: (value: string) =>
			apiInstance.request(api.v4.chats.send, {
				params: { type: 'text' },
				body: {
					channelId,
					content: value.trim(),
					replyTo: replyToMessage?.id ?? null,
				},
			}),
		onMutate: () => {
			setTimeout(() => inputRef.current?.focus(), 0);
		},
		onSuccess: (message) => {
			setContent('');
			cancelReply();
			setRenderReason('event');
			requestAnimationFrame(() => inputRef.current?.focus());

			queryClient.setQueryData<ChatChannel[] | undefined>(['chats', 'channels'], (currentValue) =>
				currentValue?.map((channel) =>
					channel.id === message.channelId ? { ...channel, lastMessageId: message.id } : channel,
				),
			);

			queryClient.setQueryData<InfiniteData<ChatMessageDto[], ChatPageParam> | undefined>(queryKey, (query) => {
				if (!query || !query.pages) {
					return {
						pages: [[message]],
						pageParams: [undefined],
					};
				}

				const firstPage = query.pages[0] ?? [];
				const restPages = query.pages.slice(1);

				if (firstPage.some((item) => item.id === message.id)) {
					return query;
				}

				return {
					...query,
					pages: [[message, ...firstPage], ...restPages],
				};
			});

			queryClient.invalidateQueries({ queryKey: ['chats', 'channels'] });
		},
		onError: (error) => {
			toast.error(String(error));
		},
	});

	function handleSend() {
		if (!isAuthenticated) {
			toast.error(t('please-sign-in'));
			return;
		}

		if (!isContentValid || isPending) {
			return;
		}

		mutate(content);
	}

	if (!activeChannelId) {
		return null;
	}

	return (
		<div>
			{replyToMessage && <ReplyBanner message={replyToMessage} onCancelReply={cancelReply} />}
			<form
				className="relative"
				onSubmit={(event) => {
					event.preventDefault();
					handleSend();
				}}
			>
				<InputGroup>
					<InputGroupTextarea
						id="block-end-textarea"
						autoFocus
						placeholder={t('your-message')}
						ref={inputRef}
						value={content}
						readOnly={isPending}
						aria-disabled={isPending}
						onChange={(event) => setContent(event.currentTarget.value)}
						onKeyDown={(event) => {
							if (!event.shiftKey && event.key === 'Enter') {
								event.preventDefault();
								handleSend();
							}
						}}
					/>
					<InputGroupAddon align="block-end">
						<InputGroupText>
							<p>
								<span className={cn({ 'text-destructive': content.length > MAX_TEXT_LENGTH })}>{content.length}</span>/
								{MAX_TEXT_LENGTH}
							</p>
						</InputGroupText>
						{!isAuthenticated && <InputGroupText><Tran text="chat.read-without-sign-in" /></InputGroupText>}
						<InputGroupButton
							size="sm"
							className="ml-auto text-accent-foreground"
							disabled={!isAuthenticated || isPending || !isContentValid}
                            type='submit'
						>
							<Send className="size-6" />
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</form>
		</div>
	);
}

function ReplyBanner({ message, onCancelReply }: { message: ChatMessageDto; onCancelReply: () => void }) {
	return (
		<div className="mb-2 flex items-start justify-between gap-2 rounded-md border pl-3 pr-1 py-2">
			<div className="min-w-0">
				<div className="flex items-center gap-2 text-sm text-primary">
					<Reply className="size-4" />
					<span className="truncate"><Tran text="chat.replying-to-message" /></span>
				</div>
				<div className="truncate text-xs text-muted-foreground">{message.content}</div>
			</div>
			<Button onClick={onCancelReply} size="icon" type="button" variant="ghost">
				<X className="size-5" />
			</Button>
		</div>
	);
}
