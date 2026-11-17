'use client';

import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';

export function ChatChannelList() {
	const { activeChannelId, channels, selectChannel, unreadChannelIds } = useChatPage();

	if (!channels || !activeChannelId) {
		return null;
	}

	return (
		<div className="flex flex-col gap-1">
			{channels.map((channel) => {
				const isActive = channel.id === activeChannelId;
				const hasUnread = unreadChannelIds.has(channel.id);

				return (
					<button
						key={channel.id}
						className={cn(
							'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
							isActive
								? 'bg-secondary font-medium text-foreground'
								: 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
						)}
						onClick={() => selectChannel(channel.id)}
						type="button"
					>
						<Hash className="size-4 shrink-0" />
						<div className="flex min-w-0 flex-1 items-center gap-2">
							<span className="truncate">{channel.name}</span>
							{hasUnread && <span className="size-2 rounded-full bg-foreground shadow-xs ml-auto" />}
						</div>
					</button>
				);
			})}
		</div>
	);
}
