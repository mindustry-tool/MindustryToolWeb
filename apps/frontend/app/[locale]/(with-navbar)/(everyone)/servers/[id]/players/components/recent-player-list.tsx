'use client';

import { api } from '@mindustry-tool/api';
import { RecentPlayerDto } from '@mindustry-tool/api';
import { Clock, Network, User, UserX } from 'lucide-react';
import ColorText from '@/components/common/color-text';
import { RelativeTime } from '@/components/common/relative-time';
import ScrollContainer from '@/components/common/scroll-container';
import { ApiItem } from '@/components/query/api-item';
import { BanButton } from '@/components/server/ban-button';
import { KickButton } from '@/components/server/kick-button';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tran } from '@/i18n/tran';
import { Badge } from '@/components/ui/badge';
import { CopyIconButton } from './copy-icon-button';

export function RecentPlayerList({ serverId }: { serverId: string }) {
	return (
		<div className="flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden bg-background/50">
			<ApiItem
				route={api.v4.servers.recentPlayers}
				params={{ id: serverId }}
				queryKey={['servers', serverId, 'recent-players']}
				refetchOnMount="always"
				refetchOnWindowFocus="always"
				loading={() => (
					<ScrollContainer className="flex-1 overflow-auto p-3">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
							{Array.from({ length: 8 }).map((_, i) => (
								<div key={i} className="flex flex-col justify-between min-h-32 rounded-xl border bg-card p-3.5 gap-2.5 shadow-lg">
									<div className="flex items-center justify-between">
										<Skeleton className="h-4 w-28 rounded" />
										<Skeleton className="h-6 w-6 rounded" />
									</div>
									<Skeleton className="h-3.5 w-36 rounded" />
									<div className="flex items-center justify-between border-t pt-2 mt-auto">
										<Skeleton className="h-3 w-20 rounded" />
										<Skeleton className="h-3 w-16 rounded" />
									</div>
								</div>
							))}
						</div>
					</ScrollContainer>
				)}
				empty={() => (
					<div className="flex flex-col items-center justify-center p-16 text-center gap-3 flex-1">
						<div className="size-12 rounded-full bg-muted flex items-center justify-center border">
							<UserX className="size-6 text-muted-foreground" />
						</div>
						<div>
							<h3 className="font-semibold text-sm text-foreground">
								<Tran text="server.no-recent-players" />
							</h3>
							<p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
								<Tran
									text="server.no-recent-players-desc"
								/>
							</p>
						</div>
					</div>
				)}
			>
				{(players) => {
					const sortedPlayers = [...players].sort((a, b) => b.joinedAt - a.joinedAt);

					if (sortedPlayers.length === 0) {
						return (
							<div className="flex flex-col items-center justify-center p-16 text-center gap-3 flex-1">
								<div className="size-12 rounded-full bg-muted flex items-center justify-center border">
									<UserX className="size-6 text-muted-foreground" />
								</div>
								<div>
									<h3 className="font-semibold text-sm text-foreground">
										<Tran text="server.no-recent-players" />
									</h3>
									<p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
										<Tran
											text="server.no-recent-players-desc"
										/>
									</p>
								</div>
							</div>
						);
					}

					return (
						<ScrollContainer className="flex-1 overflow-auto p-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
								{sortedPlayers.map((player) => (
									<RecentPlayerCard key={player.uuid || player.name} serverId={serverId} player={player} />
								))}
							</div>
						</ScrollContainer>
					);
				}}
			</ApiItem>
		</div>
	);
}

function RecentPlayerCard({ serverId, player }: { serverId: string; player: RecentPlayerDto }) {
	const { name, uuid, ip, joinedAt } = player;

	return (
		<div className="flex flex-col justify-between min-h-32 rounded-xl border border-border/70 bg-card/80 p-3.5 gap-2.5 shadow-lg hover:border-primary/50 hover:bg-card hover:shadow-xl transition-all shrink-0 overflow-hidden group">
			<div className="flex items-start justify-between gap-2 min-w-0">
				<div className="flex items-center gap-1.5 min-w-0 flex-1">
					<div className="size-6 rounded-md bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-primary transition-colors">
						<User className="size-3.5" />
					</div>
					<span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
						<ColorText text={name} />
					</span>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					<EllipsisButton variant="ghost">
						<KickButton serverId={serverId} player={player} />
						<BanButton serverId={serverId} player={player} />
					</EllipsisButton>
				</div>
			</div>

			<div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-mono">
				{ip && (
					<div className="flex items-center justify-between gap-1 bg-muted/30 border border-border/40 rounded px-2 py-1">
						<span className="truncate flex items-center gap-1.5">
							<Network className="size-3 text-muted-foreground/70" />
							{ip}
						</span>
						<CopyIconButton text={ip} label="IP" />
					</div>
				)}
				{uuid && (
					<div className="flex items-center justify-between gap-1 bg-muted/30 border border-border/40 rounded px-2 py-1">
						<span className="truncate text-[11px]">ID: {uuid}</span>
						<CopyIconButton text={uuid} label="UUID" />
					</div>
				)}
			</div>

			<div className="flex items-center justify-between text-xs border-t border-border/50 pt-2 mt-auto text-muted-foreground">
				<span className="flex items-center gap-1 text-[11px] font-mono">
					<Clock className="size-3 text-muted-foreground" />
					<RelativeTime date={new Date(joinedAt)} />
				</span>

				<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-background/50 font-mono">
					Recent
				</Badge>
			</div>
		</div>
	);
}
