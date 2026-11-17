'use client';

import ColorText from '@/components/common/color-text';
import { RelativeTime } from '@/components/common/relative-time';
import { PlayerInfoBanButton, PlayerInfoRecord } from '@/components/server/player-info-ban-button';
import { PlayerInfoUnbanButton } from '@/components/server/player-info-unban-button';
import { KickButton } from '@/components/server/kick-button';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Crown, Fingerprint, LogIn, Network, ShieldAlert, User, Users } from 'lucide-react';
import { CopyIconButton } from './copy-icon-button';

export function PlayerDossierDialog({
	player,
	serverId,
	onClose,
}: {
	player: PlayerInfoRecord;
	serverId: string;
	onClose: () => void;
}) {
	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto bg-card border shadow-2xl">
				<DialogHeader className="space-y-1 text-left">
					<div className="flex items-center gap-2 flex-wrap text-lg">
						<div className="size-8 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center text-primary shrink-0">
							<User className="size-4" />
						</div>
						<DialogTitle className="font-bold text-lg text-foreground">
							<ColorText text={player.lastName} />
						</DialogTitle>
						{player.banned && (
							<Badge variant="destructive" className="gap-1 font-medium text-xs">
								<span className="size-1.5 rounded-full bg-white animate-pulse" />
								Banned
							</Badge>
						)}
						{player.admin && (
							<Badge variant="secondary" className="gap-1 font-semibold text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20">
								<Crown className="size-3" />
								Admin
							</Badge>
						)}
					</div>
					<DialogDescription className="text-xs text-muted-foreground">
						Comprehensive player record, network telemetry, and moderation tools.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2 text-xs">
					{/* UUID Identifier Card */}
					<div className="flex flex-col gap-1.5 p-3 rounded-xl border bg-muted/30">
						<div className="flex items-center justify-between">
							<span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
								<Fingerprint className="size-3 text-muted-foreground" />
								UUID Identifier
							</span>
							<CopyIconButton text={player.id} label="UUID" />
						</div>
						<div className="font-mono text-xs text-foreground select-all break-all bg-background/60 p-2 rounded-md border border-border/40">
							{player.id}
						</div>
					</div>

					{/* Metric Stat Tiles */}
					<div className="grid grid-cols-3 gap-2 text-center">
						<div className="p-3 rounded-xl border bg-muted/20 text-center flex flex-col justify-center">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center justify-center gap-1 mb-1">
								<LogIn className="size-3" />
								Joins
							</span>
							<span className="font-bold text-base font-mono text-foreground">{player.timesJoined}</span>
						</div>
						<div className="p-3 rounded-xl border bg-muted/20 text-center flex flex-col justify-center">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center justify-center gap-1 mb-1">
								<ShieldAlert className="size-3" />
								Kicks
							</span>
							<span className={cn('font-bold text-base font-mono', player.timesKicked > 0 ? 'text-destructive' : 'text-foreground')}>
								{player.timesKicked}
							</span>
						</div>
						<div className="p-3 rounded-xl border bg-muted/20 text-center flex flex-col justify-center">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
								Last Kicked
							</span>
							<span className="font-medium text-[11px] text-foreground font-mono">
								{player.lastKicked > 0 ? <RelativeTime date={new Date(player.lastKicked)} /> : 'Never'}
							</span>
						</div>
					</div>

					{/* Known IP Addresses */}
					{(() => {
						const ipsList = (player.ips && player.ips.length > 0 ? player.ips : player.lastIP ? [player.lastIP] : [])
							.filter((ip) => Boolean(ip && ip.trim()));
						return (
							<div className="flex flex-col gap-1.5">
								<div className="font-semibold text-muted-foreground flex items-center justify-between text-xs">
									<span className="flex items-center gap-1.5">
										<Network className="size-3.5 text-muted-foreground" />
										Known IP Addresses
									</span>
									<Badge variant="outline" className="text-[10px] font-mono">{ipsList.length}</Badge>
								</div>
								<div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-lg border p-2 bg-muted/10 font-mono">
									{ipsList.length > 0 ? (
										ipsList.map((ip, i) => (
											<div key={i} className="flex items-center justify-between px-2.5 py-1 rounded-md bg-card border border-border/40 text-xs">
												<span className="truncate">{ip}</span>
												<CopyIconButton text={ip} label="IP" />
											</div>
										))
									) : (
										<span className="text-muted-foreground p-1 text-xs font-sans italic">No recorded IPs</span>
									)}
								</div>
							</div>
						);
					})()}

					{/* Known Names & Aliases */}
					{(() => {
						const namesList = (player.names && player.names.length > 0 ? player.names : player.lastName ? [player.lastName] : [])
							.filter((name) => Boolean(name && name.trim()));
						return (
							<div className="flex flex-col gap-1.5">
								<div className="font-semibold text-muted-foreground flex items-center justify-between text-xs">
									<span className="flex items-center gap-1.5">
										<Users className="size-3.5 text-muted-foreground" />
										Known Names & Aliases
									</span>
									<Badge variant="outline" className="text-[10px] font-mono">{namesList.length}</Badge>
								</div>
								<div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-lg border p-2 bg-muted/10">
									{namesList.length > 0 ? (
										namesList.map((name, i) => (
											<div key={i} className="flex items-center justify-between px-2.5 py-1 rounded-md bg-card border border-border/40 text-xs">
												<ColorText text={name} />
												<span className="text-[10px] text-muted-foreground font-mono">#{i + 1}</span>
											</div>
										))
									) : (
										<span className="text-muted-foreground p-1 text-xs italic">No alias history</span>
									)}
								</div>
							</div>
						);
					})()}

					{/* Moderation Actions */}
					<div className="flex flex-col gap-2 pt-3 border-t">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Moderation Actions
						</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<KickButton serverId={serverId} player={{ uuid: player.id, name: player.lastName }} />
							{player.banned ? (
								<PlayerInfoUnbanButton serverId={serverId} player={player} />
							) : (
								<PlayerInfoBanButton serverId={serverId} player={player} />
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
