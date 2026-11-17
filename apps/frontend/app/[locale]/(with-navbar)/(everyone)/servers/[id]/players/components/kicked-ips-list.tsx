'use client';

import { api } from '@mindustry-tool/api';
import { Ban, Clock, ShieldCheck } from 'lucide-react';
import { LocaleDate } from '@/components/common/locale-date';
import { RelativeTime } from '@/components/common/relative-time';
import ScrollContainer from '@/components/common/scroll-container';
import { ApiItem } from '@/components/query/api-item';
import { RemoveKickButton } from '@/components/server/remove-kick-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tran } from '@/i18n/tran';
import { CopyIconButton } from './copy-icon-button';

export function KickedIpsList({ serverId }: { serverId: string }) {
	return (
		<div className="flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden bg-background/50">
			<ApiItem
				route={api.v4.servers.kicks.getAll}
				params={{ id: serverId }}
				queryKey={['servers', serverId, 'kicks']}
				refetchOnMount="always"
				refetchOnWindowFocus="always"
				loading={() => (
					<ScrollContainer className="flex-1 overflow-auto p-3">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex flex-col justify-between min-h-32 rounded-xl border bg-card p-3.5 gap-2.5 shadow-lg">
									<div className="flex items-center justify-between">
										<Skeleton className="h-4 w-28 rounded" />
										<Skeleton className="h-8 w-24 rounded" />
									</div>
									<Skeleton className="h-3.5 w-32 rounded" />
									<div className="flex items-center justify-between border-t pt-2 mt-auto">
										<Skeleton className="h-3 w-20 rounded" />
									</div>
								</div>
							))}
						</div>
					</ScrollContainer>
				)}
				empty={() => (
					<div className="flex flex-col items-center justify-center p-16 text-center gap-3 flex-1">
						<div className="size-12 rounded-full bg-muted/60 flex items-center justify-center border border-border/50">
							<ShieldCheck className="size-6 text-emerald-500" />
						</div>
						<div>
							<h3 className="font-semibold text-sm text-foreground">
								<Tran text="server.no-kicked-ips" />
							</h3>
							<p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
								<Tran
									text="server.no-kicked-ips-desc"
								/>
							</p>
						</div>
					</div>
				)}
			>
				{(kicksRecord) => {
					const kicks = Object.entries(kicksRecord || {}).map(([ip, expiry]) => ({
						ip,
						expiry,
					}));

					if (kicks.length === 0) {
						return (
							<div className="flex flex-col items-center justify-center p-16 text-center gap-3 flex-1">
								<div className="size-12 rounded-full bg-muted/60 flex items-center justify-center border border-border/50">
									<ShieldCheck className="size-6 text-emerald-500" />
								</div>
								<div>
									<h3 className="font-semibold text-sm text-foreground">
										<Tran text="server.no-kicked-ips" />
									</h3>
									<p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
										<Tran
											text="server.no-kicked-ips-desc"
										/>
									</p>
								</div>
							</div>
						);
					}

					return (
						<ScrollContainer className="flex-1 overflow-auto p-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
								{kicks.map(({ ip, expiry }) => (
									<KickedIpCard key={ip} serverId={serverId} ip={ip} expiry={expiry} />
								))}
							</div>
						</ScrollContainer>
					);
				}}
			</ApiItem>
		</div>
	);
}

function KickedIpCard({ serverId, ip, expiry }: { serverId: string; ip: string; expiry: number }) {
	// eslint-disable-next-line react-hooks/purity
	const isExpired = Date.now() > expiry;

	return (
		<div className="flex flex-col justify-between min-h-32 rounded-xl border border-border/70 bg-card/80 p-3.5 gap-2.5 shadow-lg hover:border-destructive/40 hover:bg-card hover:shadow-xl transition-all shrink-0 overflow-hidden group">
			<div className="flex items-start justify-between gap-2 min-w-0">
				<div className="flex items-center gap-1.5 min-w-0 flex-1">
					<div className="size-6 rounded-md bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shrink-0">
						<Ban className="size-3.5" />
					</div>
					<div className="flex items-center gap-1 min-w-0">
						<span className="font-mono font-semibold text-sm text-foreground truncate">{ip}</span>
						<CopyIconButton text={ip} label="IP" />
					</div>
				</div>

				<RemoveKickButton serverId={serverId} ip={ip} size="sm" />
			</div>

			<div className="flex flex-col gap-1.5 bg-muted/30 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground font-mono">
				<div className="flex items-center justify-between gap-1">
					<span className="flex items-center gap-1 text-[11px]">
						<Clock className="size-3 text-muted-foreground" />
						<span>{isExpired ? 'Expired' : 'Expires:'}</span>
					</span>
					<span className={isExpired ? 'text-muted-foreground' : 'text-amber-500 font-semibold text-[11px]'}>
						<RelativeTime date={new Date(expiry)} />
					</span>
				</div>
				<span className="text-[10px] text-muted-foreground/75 truncate">
					<LocaleDate date={new Date(expiry)} />
				</span>
			</div>
		</div>
	);
}
