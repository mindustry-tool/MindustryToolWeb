'use client';

import { ChatChannelList } from '@/app/[locale]/chat/components/chat-channel-list';
import { Tran } from '@/i18n/tran';

export function ChatChannelSidebar() {
	return (
		<div className="hidden min-h-0 overflow-hidden rounded-md border lg:flex lg:flex-col">
			<div className="border-b px-3 py-2 text-sm font-medium"><Tran text="chat.channels" /></div>
			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				<ChatChannelList />
			</div>
		</div>
	);
}
