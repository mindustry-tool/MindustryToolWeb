'use client';

import ClientProtectedElement from '@/components/layout/client-protected-element';
import { PageWrapper } from '@/components/common/page-wrapper';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import LoginButton from '@/components/buttons/login-button';
import { ChatChannelSidebar } from '@/app/[locale]/chat/components/chat-channel-sidebar';
import { ChatComposer } from '@/app/[locale]/chat/components/chat-composer';
import { ChatFeed } from '@/app/[locale]/chat/components/chat-feed';
import { ChatHeader } from '@/app/[locale]/chat/components/chat-header';
import { ChatUserSidebar } from '@/app/[locale]/chat/components/chat-users-panel';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';

export function ChatPageLayout() {
	const { activeChannelId, channels, isError, isLoading, error } = useChatPage();

	if (isLoading) {
		return (
			<PageWrapper className="items-center justify-center">
				<LoadingSpinner />
			</PageWrapper>
		);
	}

	if (isError) {
		return (
			<PageWrapper>
				<ErrorMessage error={error} />
			</PageWrapper>
		);
	}

	if (!channels || channels.length === 0 || !activeChannelId) {
		return (
			<PageWrapper>
				<div className="flex h-full items-center justify-center rounded-md border bg-card p-4 text-sm text-muted-foreground">
					No chat channel available
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className="min-h-0">
			<ChatHeader />
			<div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[15rem_minmax(0,1fr)_17rem]">
				<ChatChannelSidebar />
				<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden">
					<ChatFeed />
					<ClientProtectedElement alt={<LoginButton />} filter>
						<ChatComposer />
					</ClientProtectedElement>
				</div>
				<ChatUserSidebar />
			</div>
		</PageWrapper>
	);
}
