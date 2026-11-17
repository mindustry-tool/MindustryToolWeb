'use client';

import { Crown, LogIn, ShieldAlert, User } from 'lucide-react';
import { PlayerInfoRecord } from '@/components/server/player-info-ban-button';
import ColorText from '@/components/common/color-text';
import { RelativeTime } from '@/components/common/relative-time';
import { Badge } from '@/components/ui/badge';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import { AliasPopover } from './alias-popover';

export function PlayerGridItem({
	player,
	onInspect,
}: {
	player: PlayerInfoRecord;
	onInspect: () => void;
}) {
	return (
		<div
			onClick={onInspect}
			className="group flex flex-col justify-between min-h-28 rounded-xl border border-border/70 bg-card/80 p-3.5 shadow-lg hover:border-primary/50 hover:bg-card hover:shadow-xl transition-all cursor-pointer shrink-0 overflow-hidden relative"
		>
			{/* Header row: Name + Badges */}
			<div className="flex items-start justify-between gap-2 min-w-0">
				<div className="flex items-center gap-1.5 min-w-0 flex-1">
					<div className="size-6 rounded-md bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-primary group-hover:border-primary/40 transition-colors">
						<User className="size-3.5" />
					</div>
					<span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
						<ColorText text={player.lastName} />
					</span>

					{player.names && player.names.length > 1 && (
						<AliasPopover names={player.names} />
					)}
				</div>

				<div className="flex items-center gap-1 shrink-0">
					{player.banned ? (
						<Badge variant="destructive" className="gap-1 font-medium text-[11px] px-2 py-0.5 h-5 shadow-xs">
							<span className="size-1.5 rounded-full bg-white animate-pulse" />
							<span><Tran text="banned" /></span>
						</Badge>
					) : (
						<Badge variant="outline" className="gap-1 font-normal text-[11px] px-2 py-0.5 h-5 bg-background/50">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							<span className="text-muted-foreground"><Tran text="active" /></span>
						</Badge>
					)}

					{player.admin && (
						<Badge variant="secondary" className="gap-1 font-semibold text-[11px] px-1.5 py-0.5 h-5 bg-amber-500/10 text-amber-500 border border-amber-500/20" title="Server Admin">
							<Crown className="size-3" />
						</Badge>
					)}
				</div>
			</div>

			{/* Middle row: Monospace UUID snippet */}
			<div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground/75 truncate select-none">
				<span className="truncate">UUID: {player.id}</span>
				{player.lastIP && (
					<span className="hidden sm:inline text-[10px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded">
						{player.lastIP}
					</span>
				)}
			</div>

			{/* Footer telemetry: Joins, Kicks, Last activity */}
			<div className="flex items-center justify-between text-xs border-t border-border/50 pt-2 mt-auto">
				<div className="flex items-center gap-2.5 font-mono text-muted-foreground text-[11px]">
					<span className="flex items-center gap-1">
						<LogIn className="size-3 text-muted-foreground" />
						<strong className="text-foreground font-semibold">{player.timesJoined}</strong>
					</span>
					<span>·</span>
					<span className={cn('flex items-center gap-1', player.timesKicked > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
						<ShieldAlert className="size-3" />
						<strong>{player.timesKicked}</strong> kicks
					</span>
				</div>

				{player.lastKicked > 0 && (
					<span className="text-[11px] text-destructive/90 flex items-center gap-1 shrink-0 font-medium">
						<RelativeTime date={new Date(player.lastKicked)} />
					</span>
				)}
			</div>
		</div>
	);
}
