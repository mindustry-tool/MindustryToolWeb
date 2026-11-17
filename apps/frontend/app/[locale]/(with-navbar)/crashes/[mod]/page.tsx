'use client';

import { Suspense, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { SortAsc, SortDesc, Star } from 'lucide-react';
import { api } from '@mindustry-tool/api';
import { crashQuerySchema, type CrashSortField, type ModInfoDto } from '@mindustry-tool/api';

import { PageWrapper } from '@/components/common/page-wrapper';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import { ApiItem } from '@/components/query/api-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RelativeTime } from '@/components/common/relative-time';
import ScrollContainer from '@/components/common/scroll-container';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { ModIcon } from '@/components/mod/mod-icon';
import { GithubIcon } from '@/components/icons/github-icon';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { Separator } from '@/components/ui/separator';

const SORT_OPTIONS = ['last_seen', 'first_created', 'count'] as const;
const ORDER_OPTIONS = ['asc', 'desc'] as const;
const STATUS_OPTIONS = ['ALL', 'PENDING', 'RESOLVED'] as const;

export default function Page() {
	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<Suspense fallback={<LoadingSpinner />}>
				<CrashesContent />
			</Suspense>
		</PageWrapper>
	);
}

function CrashesContent() {
	const params = useParams();
	const modParam = typeof params?.mod === 'string' ? params.mod : Array.isArray(params?.mod) ? params.mod[0] : '';
	const mod = decodeURIComponent(modParam ?? '');
	const { t } = useI18n();

	const [status, setStatus] = useQueryState(
		'status',
		parseAsStringLiteral(STATUS_OPTIONS).withDefault('ALL').withOptions({ clearOnDefault: true }),
	);

	const [sort, setSort] = useQueryState(
		'sort',
		parseAsStringLiteral(SORT_OPTIONS).withDefault('last_seen').withOptions({ clearOnDefault: true }),
	);

	const [order, setOrder] = useQueryState(
		'order',
		parseAsStringLiteral(ORDER_OPTIONS).withDefault('desc').withOptions({ clearOnDefault: true }),
	);

	const crashQueryKey = useMemo(() => ['crashes', mod, status, sort, order], [mod, status, sort, order]);
	const modInfoQueryKey = useMemo(() => ['crashes', 'mod-info', mod], [mod]);

	return (
		<>
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/crashes">
									<Tran text="crashes" />
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="font-semibold text-foreground truncate max-w-64">
								{mod}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
					<Tabs value={status} onValueChange={(val) => setStatus(val as typeof status)}>
						<TabsList>
							<TabsTrigger value="ALL" className="text-xs px-2.5">
								<Tran text="status-all" />
							</TabsTrigger>
							<TabsTrigger value="PENDING" className="text-xs px-2.5">
								<Tran text="status-pending" />
							</TabsTrigger>
							<TabsTrigger value="RESOLVED" className="text-xs px-2.5">
								<Tran text="status-resolved" />
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<Select value={sort} onValueChange={(val) => setSort(val as CrashSortField)}>
						<SelectTrigger className="text-xs min-w-31.25 rounded-md bg-card border-border/60">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="last_seen" className="text-xs">
								<Tran text="sort-last-seen" />
							</SelectItem>
							<SelectItem value="first_created" className="text-xs">
								<Tran text="sort-first-created" />
							</SelectItem>
							<SelectItem value="count" className="text-xs">
								<Tran text="sort-occurrences" />
							</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8 shrink-0 bg-card border-border/60"
						onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
						aria-label={t(order === 'desc' ? 'sort-descending' : 'sort-ascending')}
						title={t(order === 'desc' ? 'sort-descending' : 'sort-ascending')}
					>
						{order === 'desc' ? <SortDesc className="size-3.5" /> : <SortAsc className="size-3.5" />}
					</Button>
				</div>
			</div>

			<ScrollContainer className="flex-1 min-h-0">
				<div className="max-w-4xl mx-auto w-full flex flex-col gap-4 py-1">
					<ApiItem
						route={api.v4.crashes.getModInfo}
						params={{ mod }}
						queryKey={modInfoQueryKey}
						loading={() => null}
						error={() => null}
					>
						{(modInfo) => <ModHeroCard modInfo={modInfo} fallbackMod={mod} />}
					</ApiItem>

                    <Separator/>

					<InfiniteApiItem
						className="flex flex-col gap-2.5"
						route={api.v4.crashes.findAll}
						query={[crashQuerySchema, { mod, status, sort, order }]}
						queryKey={crashQueryKey}
						loading={() => <LoadingSpinner />}
						empty={() => (
							<div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-md bg-card/50">
								<p className="text-sm">
									<Tran text="no-crashes" />
								</p>
							</div>
						)}
					>
						{(pages) =>
							pages.map((page) =>
								page.map((item) => (
									<Link
										href={`/crashes/${mod}/${item.id}`}
										key={item.id}
										className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3.5 hover:bg-muted/40 hover:border-border transition-colors shadow-xs"
									>
										<div className="flex justify-between items-start gap-2">
											<p className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
												{item.cause || <Tran text="crash-report" />}
											</p>
											<Badge
												variant="outline"
												className={
													item.status === 'RESOLVED'
														? 'text-muted-foreground text-xs shrink-0'
														: 'border-destructive/30 text-destructive bg-destructive/10 text-xs shrink-0'
												}
											>
												<Tran text={item.status === 'RESOLVED' ? 'status-resolved' : 'status-pending'} />
											</Badge>
										</div>

										<p className="font-mono text-xs text-muted-foreground bg-muted/30 border border-border/40 px-2 rounded line-clamp-3 leading-relaxed overflow-hidden">
											{item.stacktrace}
										</p>

										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
											<span className="font-medium text-foreground">
												{item.count} <Tran text="occurrences" />
											</span>
											<span className="flex items-center gap-1">
												<Tran text="first-seen" />:
												<RelativeTime date={new Date(item.createdAt)} />
											</span>
											{item.updatedAt && (
												<span className="flex items-center gap-1">
													<Tran text="last-seen" />:
													<RelativeTime date={new Date(item.updatedAt)} />
												</span>
											)}
										</div>
									</Link>
								)),
							)
						}
					</InfiniteApiItem>
				</div>
			</ScrollContainer>
		</>
	);
}

function ModHeroCard({ modInfo, fallbackMod }: { modInfo: ModInfoDto; fallbackMod: string }) {
	const displayName = modInfo.name || fallbackMod;

	return (
		<div className="rounded-lg border border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-3">
			<div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
				<div className="flex items-start gap-3.5 min-w-0">
					<ModIcon
						iconUrl={modInfo.iconUrl}
						name={displayName}
						size={48}
						className="rounded-lg"
					/>
					<div className="flex flex-col gap-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
								{displayName}
							</h2>
							{modInfo.version && (
								<Badge variant="outline" className="text-xs font-mono h-5 px-1.5 text-muted-foreground">
									{modInfo.version}
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
							{modInfo.mod && (
								<span className="font-mono text-muted-foreground/80">{modInfo.mod}</span>
							)}
							{modInfo.author && (
								<>
									<span>•</span>
									<span>
										<Tran text="author" />: <span className="font-medium text-foreground">{modInfo.author}</span>
									</span>
								</>
							)}
							{modInfo.minGameVersion && (
								<>
									<span>•</span>
									<span>
										<Tran text="min-game-version" />: <span className="font-mono text-foreground">{modInfo.minGameVersion}</span>
									</span>
								</>
							)}
						</div>
					</div>
				</div>

				{modInfo.repo && (
					<Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs border-border/60 shrink-0">
						<a href={`https://github.com/${modInfo.repo}`} target="_blank" rel="noopener noreferrer">
							<GithubIcon className="size-3.5" />
							<Tran text="view-on-github" />
							{modInfo.stars != null && modInfo.stars > 0 && (
								<span className="flex items-center gap-0.5 text-xs text-muted-foreground font-mono ml-1 border-l border-border/60 pl-1.5">
									<Star className="size-3 text-amber-500 fill-amber-500/20" />
									{modInfo.stars}
								</span>
							)}
						</a>
					</Button>
				)}
			</div>

			{modInfo.description && (
				<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 overflow-hidden pt-1 border-t border-border/40">
					{modInfo.description}
				</p>
			)}
		</div>
	);
}
