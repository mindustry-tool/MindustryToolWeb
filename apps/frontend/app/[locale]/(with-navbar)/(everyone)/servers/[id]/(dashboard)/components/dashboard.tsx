'use client';
import { SERVER_STATUSES } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';

import { ReactNode, Suspense } from 'react';
import { AddressButton } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/address-button';
import ColorText from '@/components/common/color-text';
import ServerStatusBadge from '@/components/server/server-status-badge';
import { Separator } from '@/components/ui/separator';
import { UserName, UserWithIdComponent } from '@/components/user/user-component';
import { Tran, type I18nKey } from '@/i18n/tran';
import { getColor, TEXT_COLORS } from '@/lib/utils';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import ScrollContainer from '@/components/common/scroll-container';
import { CreditRemainTime } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/credit-remain-time';
import { LocaleDate } from '@/components/common/locale-date';
import { ClockIcon, Gamepad2Icon, PlugIcon, TagIcon, UserIcon, UsersIcon, MapIcon } from 'lucide-react';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import CurrentMapImage from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/current-map-image';
import HostButton from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/host-button';
import ShutdownButton from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/shutdown-button';
import DashboardMapList from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/dashboard-map-list';
import DashboardModList from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/dashboard-mod-list';
import PlayerList from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/player-list';
import UsagePanel from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/usage-panel';
import MismatchCard from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/mismatch-card';

import { PauseButton } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/pause-button';

export function Dashboard({ server: initialServer }: { server: ServerDto }) {
	const { data } = useServer(initialServer.id, initialServer);

	const server = data || initialServer;

	const { name, isOfficial, status, mode, gamemode, players, port, mapName, gameVersion, createdBy, updatedAt } =
		server;

	const statusText = SERVER_STATUSES[status];

	const isHosting = statusText === 'ONLINE' || statusText === 'PAUSED';
	const isRunning = isHosting || statusText === 'STOP';

	return (
		<ScrollContainer className="flex h-full flex-col gap-4 p-4">
			<div className="flex flex-col">
				<div className="flex flex-wrap items-center gap-2">
					<ColorText className="truncate text-2xl font-bold tracking-tight" text={name} />
					<ServerStatusBadge status={status} />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<AddressButton server={server} />
					<ClientProtectedElement filter={{ any: ['server:manage', { authorId: createdBy }] }}>
						<Suspense>
							<div className="ml-auto flex flex-wrap gap-2">
								<ShutdownButton server={{ id: server.id }} />
								{!isHosting && <HostButton server={server} />}
								<PauseButton serverId={server.id} statusText={statusText} />
							</div>
						</Suspense>
					</ClientProtectedElement>
				</div>
				{isHosting && (
					<ClientProtectedElement filter={{ any: ['server:manage', 'server:dashboard', { authorId: createdBy }] }}>
						<MismatchCard server={server} />
					</ClientProtectedElement>
				)}
			</div>
			<Separator />
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
				<StatTile icon={<Gamepad2Icon className="size-3.5" />} label="server.game-mode">
					<span className="capitalize">{mode.toLowerCase()}</span>
					{gamemode && '/'}
					{gamemode && <ColorText text={gamemode} />}
				</StatTile>
				<StatTile icon={<UsersIcon className="size-3.5" />} label="server.players">
					{players}
					/30
				</StatTile>
				{port > 0 && (
					<StatTile icon={<PlugIcon className="size-3.5" />} label="server.port">
						{port}
					</StatTile>
				)}
				{isHosting && mapName && (
					<StatTile icon={<MapIcon className="size-3.5" />} label="server.map">
						<ColorText text={mapName} />
					</StatTile>
				)}
				<StatTile icon={<TagIcon className="size-3.5" />} label="server.version">
					<span className={getColor(String(gameVersion), TEXT_COLORS)}>{gameVersion}</span>
				</StatTile>
				{updatedAt && (
					<StatTile icon={<ClockIcon className="size-3.5" />} label="server.updated-at">
						<LocaleDate date={updatedAt} />
					</StatTile>
				)}
				{!isOfficial && (
					<StatTile icon={<ClockIcon className="size-3.5" />} label="server.credit">
						<CreditRemainTime server={server} shouldRun={isRunning} />
					</StatTile>
				)}
				<StatTile icon={<UserIcon className="size-3.5" />} label="server.owner">
					<UserWithIdComponent userId={createdBy}>
						<UserName />
					</UserWithIdComponent>
				</StatTile>
			</div>
			{isHosting && (
				<ClientProtectedElement filter={{ any: ['server:manage', 'server:dashboard', { authorId: createdBy }] }}>
					<UsagePanel server={server} />
				</ClientProtectedElement>
			)}
			<Separator />
			<ClientProtectedElement filter={{ any: ['server:manage', 'server:dashboard', { authorId: createdBy }] }}>
				<SectionTitle text="server.players" count={players} />
				<Suspense>{isHosting && <PlayerList server={server} />}</Suspense>
				<Separator />
			</ClientProtectedElement>
			<div className="flex flex-col gap-2">
				<SectionTitle text="map" />
				<div className="flex w-full flex-col items-start justify-start gap-2 lg:flex-row">
					{isHosting ? (
						<Suspense
							fallback={
								<div className="flex aspect-square min-h-32 h-full w-full max-w-lg items-center justify-center rounded-lg border bg-card">
									No preview
								</div>
							}
						>
							<CurrentMapImage server={server} />
						</Suspense>
					) : (
						<div className="flex aspect-square min-h-32 h-full w-full max-w-lg items-center justify-center rounded-lg border bg-card">
							No preview
						</div>
					)}
					<Separator className="lg:hidden" />
					<Separator className="hidden lg:flex" orientation="vertical" />
					<Suspense>
						<DashboardMapList server={server} />
					</Suspense>
				</div>
			</div>
			<Separator />
			<div className="flex w-full flex-col gap-2">
				<SectionTitle text="mod" />
				<div className="flex w-full flex-col gap-2 rounded-md">
					<Suspense>
						<DashboardModList server={server} />
					</Suspense>
				</div>
			</div>
		</ScrollContainer>
	);
}

function StatTile({
	icon,
	label,
	children,
}: {
	icon: ReactNode;
	label: I18nKey;
	children: ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-3 shadow-lg">
			<span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				{icon}
				<Tran text={label} />
			</span>
			<span className="truncate text-sm font-semibold">{children}</span>
		</div>
	);
}

function SectionTitle({ text, count }: { text: I18nKey; count?: number }) {
	return (
		<div className="flex items-center gap-2">
			<Tran
				className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
				text={text}
			/>
			{count !== undefined && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{count}</span>}
		</div>
	);
}
