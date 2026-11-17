'use client';

import type { AuthFilter } from '@mindustry-tool/api';

import type { ReactNode } from 'react';
import {
	BookOpen,
	BotMessageSquare,
	Box,
	Bell,
	BugIcon,
	Calendar,
	ClipboardList,
	Compass,

	Crown,
	Database,
	Divide,
	Earth,
	Flag,
	FlagIcon,
	Github,
	Globe,
	Heart,
	HelpCircle,
	Home,
	ImageIcon,
	ImagePlus,
	Info,
	Laugh,
	Layers,
	LayoutDashboard,
	Map,
	MessageCircle,
	NotebookPen,
	Plug,
	ScanEye,
	Shield,
	Tag,
	User,
	Waypoints,
} from 'lucide-react';
import {
	UserBadge,
	VerifyBadge,
	VerifyContentPatchBadge,
	VerifyMapBadge,
	VerifySchematicBadge,
} from '@/app/[locale]/components/navbar-badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarMenuButton } from '@/components/ui/sidebar-client';
import LocaleSwitcher from '@/components/common/locale-switcher';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import Link from 'next/link';

export type NavGroupActionItem = {
	action: ReactNode;
	filter?: AuthFilter;
};

export type NavGroupMultipleItem = {
	label: ReactNode;
	icon: ReactNode;
	items: NavGroupSingleItem[];
	badge?: ReactNode;
};

export type NavGroupSingleItem = {
	label: ReactNode;
	link: string;
	icon: ReactNode;
	filter?: AuthFilter;
	badge?: ReactNode;
	className?: string;
};

export type NavGroup = {
	groupName: ReactNode;
	items: Array<NavGroupSingleItem | NavGroupMultipleItem | NavGroupActionItem>;
};

export const allGroup: NavGroup = {
	groupName: undefined,
	items: [
		{
			label: <Tran text="home" />,
			link: routes.home,
			icon: <Home />,
		},
		{
			label: <Tran text="database" />,
			icon: <Database />,
			items: [
				{
					label: <Tran text="schematic" />,
					link: routes.database.schematics.value,
					icon: <ClipboardList />,
				},
				{
					label: <Tran text="map" />,
					link: routes.database.maps.value,
					icon: <Map />,
				},
				{
					label: <Tran text="mod" />,
					link: routes.database.mods.value,
					icon: <Plug />,
				},
				{
					label: <Tran text="content-patch" />,
					link: routes.database.contentPatches.value,
					icon: <NotebookPen />,
				},
			],
		},
		{
			label: <Tran text="wiki" />,
			link: routes.wiki.value,
			icon: <Earth />,
		},
		{
			label: <Tran text="about" />,
			link: routes.about,
			icon: <Info />,
		},
	],
};

export const networkGroup: NavGroup = {
	groupName: <Tran text="network" />,
	items: [
		{
			label: <Tran text="post" />,
			link: routes.posts.value,
			icon: <BookOpen />,
		},
		{
			label: <Tran text="server" />,
			icon: <Layers />,
			items: [
				{
					label: <Tran text="server.community-servers" />,
					link: routes.communityServers,
					icon: <Globe />,
				},
				{
					label: <Tran text="server.server-explorer" />,
					link: routes.servers.value,
					icon: <Compass />,
				},
				{
					label: <Tran text="server.my-server" />,
					link: routes.me.servers,
					icon: <User />,
				},
			],
		},
		{
			label: <Tran text="player-connect" />,
			link: routes.playerConnects,
			icon: <Waypoints />,
		},
		{
			label: <Tran text="chat" />,
			link: routes.chat,
			icon: <BotMessageSquare />,
		},
	],
};
export const modGroup: NavGroup = {
	groupName: <Tran text="help" />,
	items: [
		{
			label: <Tran text="crash" />,
			link: routes.crashes,
			icon: <BugIcon />,
		},
		{
			label: <Tran text="bug-report" />,
			link: routes.bugReport,
			icon: <FlagIcon />,
		},
	],
};

export const toolGroup: NavGroup = {
	groupName: <Tran text="tools" />,
	items: [
		{
			label: <Tran text="tools.ratio-calculator" />,
			link: routes.tools.ratioCalculator,
			icon: <Divide />,
		},
		{
			label: <Tran text="tools.logic-display-generator" />,
			link: routes.tools.logicDisplayGenerator,
			icon: <ImagePlus />,
		},
		{
			label: <Tran text="tools.sorter-generator" />,
			link: routes.tools.sorterGenerator,
			icon: <ImagePlus />,
		},
		{
			label: <Tran text="tools.canvas-generator" />,
			link: routes.tools.canvasGenerator,
			icon: <ImagePlus />,
		},
		{
			label: <Tran text="mod-editor" />,
			link: routes.tools.modEditor,
			icon: <Plug />,
		},
	],
};

export const adminGroup: NavGroup = {
	groupName: <Tran text="admin" />,
	items: [
		{
			label: <Tran text="dashboard" />,
			icon: <LayoutDashboard />,
			link: routes.management.value,
			filter: 'god',
		},
		{
			label: <Tran text="management" />,
			icon: <ScanEye />,
			badge: <VerifyBadge />,
			items: [
				{
					label: <Tran text="schematic" />,
					link: routes.management.schematics.value,
					icon: <ClipboardList />,
					filter: 'schematic:manage',
					badge: <VerifySchematicBadge />,
				},
				{
					label: <Tran text="map" />,
					link: routes.management.maps.value,
					icon: <Map />,
					filter: 'map:manage',
					badge: <VerifyMapBadge />,
				},
				{
					label: <Tran text="content-patch" />,
					link: routes.management.contentPatches.value,
					icon: <NotebookPen />,
					filter: 'content-patch:manage',
					badge: <VerifyContentPatchBadge />,
				},
				{
					label: <Tran text="users" />,
					link: routes.management.users,
					icon: <User />,
					filter: 'user:manage',
					badge: <UserBadge />,
				},
				{
					label: <Tran text="role" />,
					link: routes.management.roles,
					icon: <Crown />,
					filter: 'god',
				},
				{
					label: <Tran text="notification" />,
					link: routes.management.notifications,
					icon: <Bell />,
					filter: 'notification:manage',
				},
			],
		},
		{
			label: <Tran text="moderation" />,
			icon: <Shield />,
			items: [
				{
					label: <Tran text="actions" />,
					link: routes.moderation.actions,
					icon: <Calendar />,
					filter: 'god',
				},
				{
					label: <Tran text="reports" />,
					link: routes.moderation.reports,
					icon: <Flag />,
					filter: 'god',
				},
				{
					label: <Tran text="media" />,
					link: routes.moderation.media,
					icon: <ImageIcon />,
					filter: 'god',
				},
				{
					label: <Tran text="comments" />,
					link: routes.moderation.comments,
					icon: <MessageCircle />,
					filter: 'god',
				},
			],
		},
		{
			label: <Tran text="data" />,
			link: routes.data.value,
			icon: <Box />,
			items: [
				{
					label: <Tran text="icon" />,
					link: routes.data.icon,
					icon: <Laugh />,
					filter: 'icon:manage',
				},
				{
					label: <Tran text="tag" />,
					link: routes.data.tags,
					icon: <Tag />,
					filter: 'tag:manage',
				},
				{
					label: <Tran text="wiki" />,
					link: routes.data.wiki,
					icon: <Earth />,
					filter: 'wiki:manage',
				},
				{
					label: <Tran text="image" />,
					link: routes.data.image,
					icon: <ImageIcon />,
					filter: 'god',
				},
				{
					label: <Tran text="github-uploads" />,
					link: routes.data.githubUploads,
					icon: <Github />,
					filter: 'god',
				},
				{
					label: <Tran text="api-docs" />,
					link: routes.data.apiDocs,
					icon: <BookOpen />,
					filter: 'god',
				},
				{
					label: <span>RabbitMQ</span>,
					link: routes.data.rabbitmq,
					icon: <RabbitMQIcon />,
					filter: 'god',
				},
			],
		},
	],
};

export const bottomGroup: NavGroup = {
	groupName: undefined,
	items: [
		{
			label: <Tran text="donate.nav" />,
			link: routes.donate,
			icon: <Heart />,
			className:
				'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 data-[active=true]:bg-rose-500 data-[active=true]:text-white data-[active=true]:hover:bg-rose-500 [&>svg]:text-rose-400 data-[active=true]:[&>svg]:text-white data-[active=true]:[&_svg]:text-white',
		},
		{
			action: (
				<Dialog>
					<DialogTrigger asChild>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<Globe />
								<Tran text="change-language" />
							</SidebarMenuButton>
						</SidebarMenuItem>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>
							<Tran text="change-language" />
						</DialogTitle>
						<DialogDescription>
							<Tran text="change-language-description" />
						</DialogDescription>
						<LocaleSwitcher />
						<Link className='text-sm font-bold underline' href="https://github.com/MindustryTool/MindustryToolWebTranslation">
                            Help with the translation
                        </Link>
					</DialogContent>
				</Dialog>
			),
		},
		{
			label: <Tran text="help" />,
			link: routes.help,
			icon: <HelpCircle />,
		},
	],
};

export const appGroups: NavGroup[] = [allGroup, networkGroup, toolGroup, modGroup, adminGroup];

function RabbitMQIcon() {
	return (
		<svg className="size-5" viewBox="0 0 128 128">
			<path
				fill="#ff6600"
				d="M119.517 51.188H79.291a3.641 3.641 0 0 1-3.64-3.642V5.62A5.605 5.605 0 0 0 70.028 0H55.66a5.606 5.606 0 0 0-5.627 5.62v41.646a3.913 3.913 0 0 1-3.92 3.925l-13.188.047c-2.176 0-3.972-1.75-3.926-3.926l.094-41.687A5.606 5.606 0 0 0 23.467 0H9.1a5.61 5.61 0 0 0-5.626 5.625V122.99c0 2.737 2.22 5.01 5.01 5.01h111.033a5.014 5.014 0 0 0 5.008-5.011V56.195a4.975 4.975 0 0 0-5.008-5.007zM100.66 95.242a6.545 6.545 0 0 1-6.525 6.524H82.791a6.545 6.545 0 0 1-6.523-6.524V83.9a6.545 6.545 0 0 1 6.523-6.524h11.343a6.545 6.545 0 0 1 6.525 6.523zm0 0"
			></path>
		</svg>
	);
}
