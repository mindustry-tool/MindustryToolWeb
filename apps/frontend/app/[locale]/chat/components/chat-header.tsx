'use client';

import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { Menu, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { ChatChannelList } from '@/app/[locale]/chat/components/chat-channel-list';
import { useChatPage } from '@/app/[locale]/chat/components/chat-context';
import { ChatUsersPanel } from '@/app/[locale]/chat/components/chat-users-panel';
import { Tran } from '@/i18n/tran';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function ChatHeader() {
	const { activeChannelId } = useChatPage();

	const { data: userCount } = useQuery({
		queryKey: ['chats', activeChannelId, 'user-count'],
		queryFn: () =>
			apiInstance.request(api.v4.chats.userCount, {
				query: {
					channelId: activeChannelId ?? '',
				},
			}),
		enabled: Boolean(activeChannelId),
		refetchInterval: 1000 * 60 * 5,
	});

	return (
		<div className="flex gap-2 rounded-md border bg-card p-2 items-center justify-between flex-wrap">
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<Link className="hidden sm:inline-flex gap-2 font-bold text-lg" href={routes.database.schematics.value}>
					<MindustryToolIcon className="size-6" />
					<h2>MindustryTool</h2>
				</Link>
				<ChatSidebarSheet />
			</div>
			<Sheet>
				<SheetTrigger asChild>
					<Badge className="gap-1" variant="secondary">
						<Users className="size-3.5" />
						{userCount ?? 0} <Tran text="chat.online" />
					</Badge>
				</SheetTrigger>
				<SheetContent className="gap-1">
					<SheetHeader className="border-b">
						<SheetTitle>
							<Tran text="chat.users" />
						</SheetTitle>
						<SheetDescription>
							<Tran text="chat.online-users" />
						</SheetDescription>
					</SheetHeader>
					<div className="grid min-h-0 gap-3 overflow-y-auto">
						<ChatUsersPanel mobile />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

function ChatSidebarSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button className="lg:hidden" size="icon" variant="ghost">
					<Menu className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[88vw] p-0 sm:max-w-md" side="left">
				<SheetHeader className="border-b">
					<SheetTitle className="grid">
						<Link className="inline-flex gap-2 font-bold text-lg" href={routes.database.schematics.value}>
							<MindustryToolIcon className="size-6" />
							<h2>MindustryTool</h2>
						</Link>
					</SheetTitle>
					<VisuallyHidden>
						<SheetDescription />
					</VisuallyHidden>
				</SheetHeader>
				<div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 pt-0">
					<ChatChannelList />
				</div>
			</SheetContent>
		</Sheet>
	);
}
