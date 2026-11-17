'use client';

import type { ChatUserDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import ColorText from '@/components/common/color-text';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { cn } from '@/lib/utils';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';
import { Tran } from '@/i18n/tran';

export function ChatUserSidebar() {
	return (
		<div className="hidden min-h-0 overflow-hidden rounded-md border bg-background lg:flex lg:flex-col">
			<ChatUsersPanel />
		</div>
	);
}

export function ChatUsersPanel({ mobile = false }: { mobile?: boolean }) {
	const { activeChannelId } = useChatPage();

	const { data, error, isError, isLoading } = useQuery({
		queryKey: ['chats', activeChannelId, 'users'],
		queryFn: () =>
			apiInstance.request(api.v4.chats.users, {
				query: {
					channelId: activeChannelId ?? '',
				},
			}),
		enabled: Boolean(activeChannelId),
		refetchInterval: 1000 * 60 * 5,
	});

	return (
		<div className={cn('flex min-h-0 flex-col overflow-hidden', mobile && 'rounded-md bg-background')}>
			<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
				{isLoading && <LoadingSpinner />}
				{isError && <ErrorMessage error={error} />}
				{!isLoading && !isError && data?.length === 0 && (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground"><Tran text="chat.nobody-online" /></div>
				)}
				{data?.map((user) => (
					<ChatUserCard key={user.id} user={user} />
				))}
			</div>
		</div>
	);
}

function ChatUserCard({ user }: { user: ChatUserDto }) {
	return (
		<UserWithIdComponent clickable={false} userId={user.id}>
			<div className="flex items-start gap-2 rounded-lg p-2 bg-card">
				<UserAvatar size={28} />
				<div className="flex min-w-0 flex-1 flex-col">
					<UserName className="truncate" />
					<span className="truncate text-xs text-muted-foreground">
						{user.state && user.state != '' && (
							<ColorText className="text-muted-foreground text-xs" text={user.state} />
						)}
					</span>
				</div>
			</div>
		</UserWithIdComponent>
	);
}
