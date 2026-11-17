'use client';

import type { AuthFilter } from '@mindustry-tool/api';
import type { ReactNode } from 'react';
import {
	FileIcon,
	LayoutDashboardIcon,
	MapIcon,
	PuzzleIcon,
	SettingsIcon,
	TerminalIcon,
	WorkflowIcon,
	Compass,
	Bell,
	Users,
	ShieldCheck,
	CoinsIcon,
	BracesIcon,
	SlidersHorizontalIcon,
	AlertTriangleIcon,
} from 'lucide-react';
import type { NavGroup, NavGroupSingleItem } from '@/app/[locale]/components/nav-groups';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

export type ServerLink = {
	id: string;
	href: string;
	label: ReactNode;
	icon: ReactNode;
	filter?: AuthFilter;
	matchHref?: string;
};

export function getServerLinks(ownerId: string | undefined, showCreditPage: boolean): ServerLink[] {
	const accessFilter: (filter: AuthFilter) => AuthFilter = (filter) => ({
		any: ['server:manage', { authorId: ownerId }, filter],
	});

	return [
		{
			id: 'dashboard',
			href: '',
			label: <Tran text="dashboard" />,
			icon: <LayoutDashboardIcon className="size-5" />,
		},
		{
			id: 'console',
			href: '/console',
			label: <Tran text="console" />,
			icon: <TerminalIcon className="size-5" />,
			filter: accessFilter('server:console'),
		},
		{
			id: 'map', //
			href: '/maps',
			label: <Tran text="map" />,
			icon: <MapIcon className="size-5" />,
			filter: accessFilter('server:map'),
		},
		{
			id: 'mod',
			href: '/mods',
			label: <Tran text="mod" />,
			icon: <PuzzleIcon className="size-5" />,
			filter: accessFilter('server:mod'),
		},
		{
			id: 'credit',
			href: '/credit',
			label: <Tran text="credit" />,
			icon: <CoinsIcon className="size-5" />,
			filter: accessFilter('server:setting'),
		},
		{
			id: 'players',
			href: '/players',
			label: <Tran text="server.players" />,
			icon: <Users className="size-5" />,
			filter: accessFilter('server:dashboard'),
		},
		{
			id: 'admin',
			href: '/admin',
			label: <Tran text="server.admin" />,
			icon: <ShieldCheck className="size-5" />,
			filter: accessFilter('server:setting'),
		},
		{
			id: 'webhooks',
			href: '/webhooks',
			label: <Tran text="server.webhook" />,
			icon: <Bell className="size-5" />,
			filter: accessFilter('server:setting'),
		},
		{
			id: 'workflow',
			href: '/workflows',
			label: <Tran text="workflow" />,
			icon: <WorkflowIcon className="size-5" />,
			filter: accessFilter('server:workflow'),
		},
		// {
		// 	id: 'data',
		// 	href: '/data',
		// 	label: <Tran text="data" />,
		// 	icon: <HardDriveIcon className="size-5" />,
		// 	filter: accessFilter('server:data'),
		// },
		{
			id: 'file', //
			href: '/files',
			label: <Tran text="file" />,
			icon: <FileIcon className="size-5" />,
			filter: accessFilter('server:file'),
		},
		{
			id: 'environment',
			href: '/environment',
			label: <Tran text="server.env" />,
			icon: <BracesIcon className="size-5" />,
			filter: accessFilter('server:setting'),
		},
		{
			id: 'setting', //
			href: '/settings/general',
			label: <Tran text="setting" />,
			icon: <SettingsIcon className="size-5" />,
			filter: accessFilter('server:setting'),
			matchHref: '/settings',
		},
	].filter((item) => showCreditPage || item.id !== 'credit');
}

export function getServerNavGroups(serverId: string, ownerId: string | undefined, showCreditPage: boolean): NavGroup[] {
	const links = getServerLinks(ownerId, showCreditPage);
	const root = `${routes.servers.value}/${serverId}`;
	const settingFilter = links.find((l) => l.id === 'setting')?.filter;

	const find = (id: string) => links.find((l) => l.id === id);

	const toItem = (id: string): NavGroupSingleItem | undefined => {
		const link = find(id);
		if (!link) return undefined;
		return {
			label: link.label,
			link: `${root}${link.href}`,
			icon: link.icon,
			filter: link.filter,
		};
	};

	const groups: NavGroup[] = [
		{
			groupName: undefined,
			items: [
				{
					label: <Tran text="server.server-explorer" />,
					link: routes.servers.value,
					icon: <Compass />,
				},
				...([toItem('dashboard'), toItem('console')].filter(Boolean) as NavGroupSingleItem[]),
			],
		},
		{
			groupName: <Tran text="content" />,
			items: [toItem('map'), toItem('mod')].filter(Boolean) as NavGroupSingleItem[],
		},
		{
			groupName: <Tran text="management" />,
			items: [toItem('players'), toItem('credit'), toItem('admin'), toItem('webhooks'), toItem('workflow')].filter(
				Boolean,
			) as NavGroupSingleItem[],
		},
		{
			groupName: <Tran text="data" />,
			items: [toItem('data'), toItem('file'), toItem('environment')].filter(Boolean) as NavGroupSingleItem[],
		},
		{
			groupName: <Tran text="config" />,
			items: [
				{
					label: <Tran text="server.general" />,
					link: `${root}/settings/general`,
					icon: <SettingsIcon className="size-5" />,
					filter: settingFilter,
				},
				{
					label: <Tran text="server.advanced" />,
					link: `${root}/settings/admin`,
					icon: <SlidersHorizontalIcon className="size-5" />,
					filter: settingFilter,
				},
				{
					label: <Tran text="server.dangerous" />,
					link: `${root}/settings/danger`,
					icon: <AlertTriangleIcon className="size-5" />,
					filter: settingFilter,
				},
			],
		},
	];

	return groups;
}
