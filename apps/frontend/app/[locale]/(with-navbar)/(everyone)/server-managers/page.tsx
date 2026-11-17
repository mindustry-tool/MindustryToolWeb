'use client';

import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
	ArrowUpRight,
	Globe,
	Layers,
	Network,
	Plus,
	Server,
} from 'lucide-react';
import { Suspense } from 'react';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { CreateServerManagerDialog } from '@/app/[locale]/(with-navbar)/(everyone)/server-managers/components/create-server-manager-dialog';
import { LocalLink } from '@/components/common/locale-link';
import { PageFooter, PageHeader, PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { ApiItem } from '@/components/query/api-item';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

export default function Page() {
	return (
		<Suspense fallback={<ServerManagersSkeleton />}>
			<ServerManagersContent />
		</Suspense>
	);
}

function ServerManagersContent() {
	const [createOpen, setCreateOpen] = useQueryState('create', parseAsBoolean.withDefault(false));

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			{/* Page Header */}
			<PageHeader className="justify-between gap-3 pb-3 border-b flex-wrap items-center">
				<div>
					<h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
						<Tran text="server.my-server-manager" />
					</h1>
					<p className="text-xs text-muted-foreground">
						Remote orchestrator daemon nodes managing your Mindustry game instances.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
						<LocalLink href={routes.me.servers}>
							<Layers className="size-3.5 text-muted-foreground" />
							<span>My Servers</span>
						</LocalLink>
					</Button>

					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="h-9 gap-1.5 text-xs">
								<Plus className="size-3.5" />
								<Tran text="server.create-server-manager" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>
								<Tran text="server.create-server-manager" />
							</DialogTitle>
							<VisuallyHidden>
								<DialogDescription />
							</VisuallyHidden>
							<CreateServerManagerDialog />
						</DialogContent>
					</Dialog>
				</div>
			</PageHeader>

			{/* Server Managers Grid */}
			<ScrollContainer className="flex-1 min-h-0">
				<ApiItem
					route={api.v4.servers.managers.getMyServerManagers}
					queryKey={['server-manager', 'me']}
					loading={() => <ServerManagersSkeletonGrid />}
					empty={() => (
						<div className="flex flex-col items-center justify-center p-16 text-center gap-4 border rounded-xl bg-background/50 flex-1">
							<div className="size-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
								<Server className="size-7" />
							</div>
							<div className="space-y-1">
								<h3 className="font-bold text-base text-foreground">No server managers connected</h3>
								<p className="text-xs text-muted-foreground max-w-md">
									Connect your self-hosted Mindustry server manager daemon endpoint to deploy and manage game servers.
								</p>
							</div>
							<Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 text-xs mt-1">
								<Plus className="size-3.5" />
								<Tran text="server.create-server-manager" />
							</Button>
						</div>
					)}
				>
					{(items) => (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{items.map(({ id, name, address }) => (
								<LocalLink
									key={id}
									href={routes.serverManagers.id({ id })}
									className="group relative flex flex-col justify-between min-h-35 rounded-xl border border-border/70 bg-card/80 p-4 gap-3 shadow-lg hover:border-primary/50 hover:bg-card hover:shadow-xl transition-all duration-200 overflow-hidden"
								>
									<div className="flex items-start justify-between gap-3 min-w-0">
										<div className="flex items-center gap-3 min-w-0 flex-1">
											<div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:border-primary/40 transition-colors">
												<Server className="size-5" />
											</div>
											<div className="flex flex-col min-w-0 flex-1">
												<span className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
													{name}
												</span>
												<span className="font-mono text-[11px] text-muted-foreground/80 truncate flex items-center gap-1">
													<Globe className="size-3 text-muted-foreground/60 shrink-0" />
													{address}
												</span>
											</div>
										</div>

										<span className="size-7 rounded-lg border bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shrink-0">
											<ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
										</span>
									</div>

									<div className="flex items-center justify-between text-xs border-t border-border/50 pt-2.5 mt-auto">
										<span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
											<Network className="size-3 text-muted-foreground/70" />
											<span>ID: {id.slice(0, 8)}...</span>
										</span>

										<span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
											Configure & Keys &rarr;
										</span>
									</div>
								</LocalLink>
							))}
						</div>
					)}
				</ApiItem>
			</ScrollContainer>

			{/* Page Footer */}
			<PageFooter className="justify-between border-t pt-2.5">
				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
						<LocalLink href={routes.servers.value}>
							<span>Server Explorer</span>
						</LocalLink>
					</Button>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="hidden sm:inline">Daemon Orchestration</span>
				</div>
			</PageFooter>
		</PageWrapper>
	);
}

function ServerManagersSkeletonGrid() {
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="flex flex-col justify-between min-h-35 rounded-xl border border-border/70 bg-card/80 p-4 gap-3 shadow-lg">
					<div className="flex items-center gap-3">
						<Skeleton className="size-10 rounded-xl" />
						<div className="flex flex-col gap-1.5 flex-1">
							<Skeleton className="h-4 w-32 rounded" />
							<Skeleton className="h-3 w-44 rounded" />
						</div>
					</div>
					<div className="flex items-center justify-between pt-2 border-t mt-auto">
						<Skeleton className="h-4 w-24 rounded" />
						<Skeleton className="h-4 w-20 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

function ServerManagersSkeleton() {
	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<div className="flex items-center justify-between pb-3 border-b">
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-5 w-40 rounded" />
					<Skeleton className="h-3.5 w-64 rounded" />
				</div>
				<Skeleton className="h-9 w-36 rounded" />
			</div>
			<ServerManagersSkeletonGrid />
		</PageWrapper>
	);
}

