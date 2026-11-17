'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { SERVER_STATUSES } from '@mindustry-tool/api';
import { ArrowUpRight, Cpu, Gamepad2, MapIcon, MapPinned, Network, Server, Users } from 'lucide-react';
import Image from 'next/image';
import ColorText from '@/components/common/color-text';
import { LocalLink } from '@/components/common/locale-link';
import ServerStatusBadge from '@/components/server/server-status-badge';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { getColor, TEXT_COLORS } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function ServerCardSkeleton() {
	return (
		<div className="flex flex-col justify-between min-h-55 rounded-xl border border-border bg-card p-5 gap-4 shadow-lg">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Skeleton className="size-9 rounded-md shrink-0" />
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-36 rounded" />
						<Skeleton className="h-3.5 w-24 rounded" />
					</div>
				</div>
				<Skeleton className="h-5 w-16 rounded-md" />
			</div>
			<div className="grid grid-cols-2 gap-2 pt-3 border-t">
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="col-span-2 h-8 w-full rounded-md" />
				<Skeleton className="col-span-2 h-8 w-full rounded-md" />
			</div>
			<div className="flex items-center justify-between pt-3 border-t mt-auto">
				<Skeleton className="h-4 w-28 rounded" />
				<Skeleton className="h-4 w-16 rounded" />
			</div>
		</div>
	);
}

export function ServerCard({ server }: { server: ServerDto }) {
	const {
		id,
		name,
		avatar,
		isOfficial,
		isHub,
		isDefault,
		status,
		mode,
		gamemode,
		players,
		port,
		mapName,
		gameVersion,
		address,
	} = server;
	const statusText = SERVER_STATUSES[status];
	const isHosting = statusText === 'ONLINE' || statusText === 'PAUSED';

	const maxPlayers = 30;
	const playerPercent = Math.min(Math.round((players / maxPlayers) * 100), 100);

	return (
		<LocalLink
			key={id}
			href={routes.servers.id({ id }).value}
			className="group relative flex flex-col justify-between min-h-55 rounded-xl border border-border bg-card p-5 gap-4 shadow-lg hover:border-primary/50 hover:shadow-xl transition-all duration-200 overflow-hidden"
		>
			{/* Header: Avatar, Name, Address & Status / Subtle Badges */}
			<div className="flex items-start justify-between gap-3 min-w-0">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<div className="size-9 rounded-md bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden group-hover:border-primary/40 transition-colors">
						{avatar ? (
							<Image className="size-full object-cover" src={avatar} alt="" width={36} height={36} loading="lazy" decoding="async" />
						) : (
							<Server className="size-4" />
						)}
					</div>
					<div className="flex flex-col min-w-0 flex-1 gap-0.5">
						<span className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate leading-tight">
							<ColorText text={name} />
						</span>
						<span className="font-mono text-xs text-muted-foreground/80 truncate flex items-center gap-1.5">
							<Network className="size-3.5 text-muted-foreground/60 shrink-0" />
							{address ? `${address}${port > 0 ? `:${port}` : ''}` : port > 0 ? `Port: ${port}` : 'Standard Node'}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
					{isOfficial && (
						<Badge variant="outline" className="text-xs font-normal text-muted-foreground">
							<Tran text="server.official" />
						</Badge>
					)}
					{isHub && (
						<Badge variant="outline" className="text-xs font-normal text-muted-foreground">
							Hub
						</Badge>
					)}
					{isDefault && (
						<Badge variant="outline" className="text-xs font-normal text-muted-foreground">
							Default
						</Badge>
					)}
					<ServerStatusBadge status={status} />
				</div>
			</div>

			{/* Telemetry Metrics */}
			<div className="grid grid-cols-2 gap-2">
				{/* Game Mode */}
				<div className="flex items-center gap-2 min-w-0 text-muted-foreground bg-muted/25 rounded-md px-3 py-2 border border-border/30">
					<Gamepad2 className="size-4 text-muted-foreground/70 shrink-0" />
					<span className="truncate capitalize text-xs">
						{mode.toLowerCase()}
						{gamemode && <span className="text-foreground/80 font-medium"> · {gamemode}</span>}
					</span>
				</div>

				{/* Active Players */}
				<div className="flex items-center justify-between gap-2 text-muted-foreground bg-muted/25 rounded-md px-3 py-2 border border-border/30 font-mono text-xs">
					<span className="flex items-center gap-1.5">
						<Users className="size-4 text-muted-foreground/70 shrink-0" />
						<strong className={players > 0 ? 'text-primary font-semibold' : 'text-foreground'}>{players}</strong>
						<span className="text-muted-foreground/60">/{maxPlayers}</span>
					</span>
					{isHosting && (
						<div className="w-10 h-2 bg-muted rounded-full overflow-hidden shrink-0">
							<div
								className="h-full bg-emerald-500 transition-all rounded-full"
								style={{ width: `${playerPercent}%` }}
							/>
						</div>
					)}
				</div>

				{/* Current Map (Full width if present) */}
				{isHosting && mapName && (
					<div className="col-span-2 flex items-center gap-2 text-muted-foreground bg-muted/25 rounded-md px-3 py-2 border border-border/30 text-xs">
						<MapIcon className="size-4 text-muted-foreground/70 shrink-0" />
						<span className="text-muted-foreground/80 shrink-0">
							<Tran text="server.map" />:
						</span>
						<span className="truncate font-medium text-foreground">
							<ColorText text={mapName} />
						</span>
					</div>
				)}
				<div className="col-span-2 flex items-center gap-2 text-muted-foreground bg-muted/25 rounded-md px-3 py-2 border border-border/30 text-xs">
					<MapPinned className="size-4 text-muted-foreground/70 shrink-0" />
					<span className="text-muted-foreground/80 shrink-0">
						<Tran text="server.port" />:
					</span>
					<span className="truncate font-medium text-foreground">{port}</span>
				</div>
			</div>

			{/* Footer: Version & Action prompt */}
			<div className="flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
				<div className="flex items-center gap-1.5 text-xs font-mono">
					<Cpu className="size-3.5 text-muted-foreground/70" />
					<span className={getColor(String(gameVersion), TEXT_COLORS)}>v{gameVersion}</span>
				</div>

				<span className="text-xs text-muted-foreground/70 group-hover:text-primary flex items-center gap-1 font-medium transition-colors">
					<span>
						<Tran text="server.manage" />
					</span>
					<ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
				</span>
			</div>
		</LocalLink>
	);
}
