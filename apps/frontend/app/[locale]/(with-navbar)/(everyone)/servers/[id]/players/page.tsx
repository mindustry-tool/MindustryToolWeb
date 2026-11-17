'use client';

import { Suspense, use, useEffect, useMemo, useState } from 'react';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { api } from '@mindustry-tool/api';
import { Ban, ChevronLeft, ChevronRight, Clock, Gavel, SearchIcon, Users, UserX, X } from 'lucide-react';
import { usePaginationSize } from '@/hooks/use-pagination-size';

import { PageHeader, PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { PlayerInfoRecord } from '@/components/server/player-info-ban-button';
import { ServerError } from '@/components/server/server-fetch-state';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import ComboBox from '@/components/combo-box/combo-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiItem } from '@/components/query/api-item';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';
import { PlayerGridItem } from './components/player-grid-item';
import { PlayerDossierDialog } from './components/player-dossier-dialog';
import { RecentPlayerList } from './components/recent-player-list';
import { KickedIpsList } from './components/kicked-ips-list';

const BANNED_FILTER_OPTIONS = ['ALL', 'ACTIVE', 'BANNED'] as const;
type BannedFilterOption = (typeof BANNED_FILTER_OPTIONS)[number];

const VIEW_TAB_OPTIONS = ['registry', 'recent', 'kicks'] as const;

export default function PlayersPage({ params }: PageProps<'/[locale]/servers/[id]'>) {
	const { id } = use(params);

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<Suspense fallback={<LoadingSpinner />}>
				<PlayerInfosContent serverId={id} />
			</Suspense>
		</PageWrapper>
	);
}

function PlayerInfosContent({ serverId }: { serverId: string }) {
	const { t } = useI18n('server');
	const [size, setSize] = usePaginationSize();
	const [viewTab, setViewTab] = useQueryState(
		'tab',
		parseAsStringLiteral(VIEW_TAB_OPTIONS).withDefault('registry').withOptions({ clearOnDefault: true }),
	);
	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
	const [filter, setFilter] = useQueryState('q', parseAsString.withDefault('').withOptions({ clearOnDefault: true }));
	const [bannedFilter, setBannedFilter] = useQueryState(
		'banned',
		parseAsStringLiteral(BANNED_FILTER_OPTIONS).withDefault('ALL').withOptions({ clearOnDefault: true }),
	);

	const [searchTerm, setSearchTerm] = useState(filter);
	const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfoRecord | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm !== filter) {
				setFilter(searchTerm);
				setPage(0);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [searchTerm, filter, setFilter, setPage]);

	const bannedQueryParam = useMemo(() => {
		if (bannedFilter === 'BANNED') return true;
		if (bannedFilter === 'ACTIVE') return false;
		return undefined;
	}, [bannedFilter]);

	const searchQueryParam = useMemo(() => {
		const trimmed = filter.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}, [filter]);

	const handleBannedFilterChange = (val: BannedFilterOption) => {
		setBannedFilter(val);
		setPage(0);
	};

	const handleSizeChange = (val: string) => {
		const newSize = Number.parseInt(val, 10);
		if (!Number.isNaN(newSize)) {
			setSize(newSize);
			setPage(0);
		}
	};

	const clearFilters = () => {
		setSearchTerm('');
		setFilter('');
		setBannedFilter('ALL');
		setPage(0);
	};

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center p-16 text-center gap-3 border rounded-xl bg-background/50 flex-1">
			<div className="size-12 bg-muted flex items-center justify-center border">
				<UserX className="size-6 text-muted-foreground" />
			</div>
			<div>
				<h3 className="font-semibold text-sm text-foreground">No players found</h3>
				<p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
					{filter || bannedFilter !== 'ALL'
						? 'No player records match your active search filters.'
						: 'This server currently has no recorded player join history.'}
				</p>
			</div>
			{(filter || bannedFilter !== 'ALL') && (
				<Button variant="outline" size="sm" onClick={clearFilters} className="mt-1 h-8 text-xs">
					Reset Filters
				</Button>
			)}
		</div>
	);

	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex flex-col h-full overflow-hidden gap-3">
				{/* Top Header */}
				<PageHeader className="justify-between gap-2 pb-2.5 border-b flex-wrap items-center">
					<div className="flex items-center gap-3">
						<div>
							<h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
								<Tran text="server.players" />
							</h1>
							<p className="text-xs text-muted-foreground">
								Player directory, telemetry records, and moderation actions.
							</p>
						</div>
					</div>

					{/* View Switcher Tabs */}
					<div className="flex items-center gap-1 p-1 rounded-lg border bg-muted/40 shadow-xs">
						<button
							type="button"
							onClick={() => setViewTab('registry')}
							className={cn(
								'flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-all',
								viewTab === 'registry'
									? 'bg-background text-foreground font-semibold shadow-xs'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
							)}
						>
							<Users className="size-3.5" />
							<Tran text="server.player-registry" />
						</button>
						<button
							type="button"
							onClick={() => setViewTab('recent')}
							className={cn(
								'flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-all',
								viewTab === 'recent'
									? 'bg-background text-foreground font-semibold shadow-xs'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
							)}
						>
							<Clock className="size-3.5" />
							<Tran text="server.recent-players" />
						</button>
						<button
							type="button"
							onClick={() => setViewTab('kicks')}
							className={cn(
								'flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-all',
								viewTab === 'kicks'
									? 'bg-background text-foreground font-semibold shadow-xs'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
							)}
						>
							<Ban className="size-3.5 text-destructive" />
							<Tran text="server.kicked-ips" />
						</button>
					</div>
				</PageHeader>

				{viewTab === 'recent' && <RecentPlayerList serverId={serverId} />}

				{viewTab === 'kicks' && <KickedIpsList serverId={serverId} />}

				{viewTab === 'registry' && (
					<>
						{/* Search & Filter Toolbar */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
							<div className="relative flex-1 min-w-60 sm:max-w-md">
								<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									className="pl-9 pr-9 h-9 text-sm rounded-lg"
									placeholder={t('player-uuid-placeholder')}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								{searchTerm && (
									<button
										type="button"
										onClick={() => {
											setSearchTerm('');
											setFilter('');
											setPage(0);
										}}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
										title="Clear search"
									>
										<X className="size-4" />
									</button>
								)}
							</div>

							<div className="grid grid-cols-3 p-0.5 rounded-lg border bg-muted/40 overflow-hidden divide-x divide-border w-full sm:w-72 shadow-xs">
								<button
									type="button"
									onClick={() => handleBannedFilterChange('ALL')}
									className={cn(
										'flex items-center justify-center gap-1.5 px-2 h-8 text-xs font-medium transition-all text-center rounded-sm',
										bannedFilter === 'ALL'
											? 'bg-background text-foreground font-semibold shadow-xs'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
									)}
								>
									<Tran text="all" />
								</button>
								<button
									type="button"
									onClick={() => handleBannedFilterChange('ACTIVE')}
									className={cn(
										'flex items-center justify-center gap-1.5 px-2 h-8 text-xs font-medium transition-all text-center rounded-sm',
										bannedFilter === 'ACTIVE'
											? 'bg-background text-foreground font-semibold shadow-xs'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
									)}
								>
									<span className="size-1.5 rounded-full bg-emerald-500" />
									<Tran text="active" />
								</button>
								<button
									type="button"
									onClick={() => handleBannedFilterChange('BANNED')}
									className={cn(
										'flex items-center justify-center gap-1.5 px-2 h-8 text-xs font-medium transition-all text-center rounded-sm',
										bannedFilter === 'BANNED'
											? 'bg-background text-destructive font-semibold shadow-xs'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
									)}
								>
									<Gavel className="size-3 text-destructive" />
									<Tran text="banned" />
								</button>
							</div>
						</div>

						{/* Player Items List */}
						<ApiItem
							route={api.v4.servers.players.getPlayerInfos}
							params={{ id: serverId }}
							query={{
								page,
								size,
								banned: bannedQueryParam,
								filter: searchQueryParam,
							}}
							queryKey={['servers', serverId, 'player-infos']}
							loading={() => (
								<div className="flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden bg-background/50">
									<ScrollContainer className="flex-1 overflow-auto p-3">
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
											{Array.from({ length: Math.min(size, 20) }).map((_, i) => (
												<div key={i} className="flex flex-col justify-between min-h-28 rounded-xl border bg-card p-3.5 gap-2.5 shadow-lg">
													<div className="flex items-center justify-between gap-2">
														<Skeleton className="h-4 w-28 rounded" />
														<Skeleton className="h-5 w-14 rounded-full" />
													</div>
													<Skeleton className="h-3 w-36 rounded" />
													<div className="flex items-center justify-between border-t pt-2 mt-auto">
														<Skeleton className="h-3.5 w-24 rounded" />
														<Skeleton className="h-3.5 w-16 rounded" />
													</div>
												</div>
											))}
										</div>
									</ScrollContainer>

									<div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/20">
										<div className="flex items-center gap-3">
											<Skeleton className="h-4 w-36 rounded" />
											<Skeleton className="h-8 w-20 rounded" />
										</div>
										<div className="flex items-center gap-2">
											<Skeleton className="h-9 w-16 rounded" />
											<Skeleton className="h-8 w-24 rounded" />
											<Skeleton className="h-9 w-16 rounded" />
										</div>
									</div>
								</div>
							)}
							empty={renderEmptyState}
							error={(err) => <ServerError error={err} />}
						>
							{(data) => {
								const totalItems = data?.items ?? 0;
								const playerRecords = data?.data ?? [];
								const lastPage = Math.max(Math.ceil(totalItems / size) - 1, 0);

								if (playerRecords.length === 0) {
									return renderEmptyState();
								}

								const startItem = totalItems > 0 ? page * size + 1 : 0;
								const endItem = Math.min((page + 1) * size, totalItems);

								return (
									<div className="flex flex-col flex-1 min-h-0 border rounded-xl overflow-hidden bg-background/50 shadow-xs">
										<ScrollContainer className="flex-1 overflow-auto p-3">
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
												{playerRecords.map((player) => (
													<PlayerGridItem key={player.id} player={player} onInspect={() => setSelectedPlayer(player)} />
												))}
											</div>
										</ScrollContainer>

										{/* Pagination Footer */}
										<div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t bg-muted/20 text-xs">
											<div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
												<span className="font-mono text-muted-foreground">
													Showing{' '}
													<span className="font-semibold text-foreground">
														{startItem}–{endItem}
													</span>{' '}
													of <span className="font-semibold text-foreground">{totalItems.toLocaleString()}</span>
												</span>

												<div className="flex items-center gap-2">
													<span className="text-muted-foreground hidden sm:inline text-[11px]">Per page:</span>
													<ComboBox
														required
														className="w-18 h-7 text-xs bg-background"
														value={size.toString()}
														values={['10', '20', '30', '50', '100']}
														onChange={handleSizeChange}
													/>
												</div>
											</div>

											<div className="flex items-center gap-1.5">
												<Button
													variant="outline"
													size="sm"
													className="h-8 px-2.5 gap-1 disabled:opacity-40 text-xs"
													disabled={page <= 0}
													onClick={() => setPage(Math.max(page - 1, 0))}
												>
													<ChevronLeft className="size-3.5" />
													<span><Tran text="server.prev" /></span>
												</Button>

												<div className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-muted/70 border text-foreground">
													{page + 1} / {Math.max(lastPage + 1, 1)}
												</div>

												<Button
													variant="outline"
													size="sm"
													className="h-8 px-2.5 gap-1 disabled:opacity-40 text-xs"
													disabled={page >= lastPage}
													onClick={() => setPage(Math.min(page + 1, lastPage))}
												>
													<span><Tran text="server.next" /></span>
													<ChevronRight className="size-3.5" />
												</Button>
											</div>
										</div>
									</div>
								);
							}}
						</ApiItem>
					</>
				)}

				{selectedPlayer && (
					<PlayerDossierDialog player={selectedPlayer} serverId={serverId} onClose={() => setSelectedPlayer(null)} />
				)}
			</div>
		</TooltipProvider>
	);
}
