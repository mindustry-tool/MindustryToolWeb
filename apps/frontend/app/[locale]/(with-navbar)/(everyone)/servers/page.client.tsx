'use client';

import { useState, Suspense } from 'react';
import { api } from '@mindustry-tool/api';
import { paginationQuerySchema, type ServerDto } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
	Plus,
	Search,
	Settings2,
	User,
	X,
} from 'lucide-react';

import dynamic from 'next/dynamic';

const CreateServerDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(everyone)/servers/components/create-server-dialog').then((mod) => mod.CreateServerDialog),
	{ ssr: false },
);
import LoginButton from '@/components/buttons/login-button';
import { LocalLink } from '@/components/common/locale-link';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { ServerCard, ServerCardSkeleton } from '@/components/server/server-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import ScrollContainer from '@/components/common/scroll-container';
import { PageFooter, PageHeader, PageWrapper } from '@/components/common/page-wrapper';

const SERVERS_QUERY_KEY = ['servers'];

export function PageClient() {
	const [search, setSearch] = useState('');

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			{/* Explorer Header */}
			<PageHeader className="justify-between gap-3 pb-3 border-b flex-wrap items-center">
				<div>
					<h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
						<Tran text="server.explorer" />
					</h1>
					<p className="text-xs text-muted-foreground">
						Discover public Mindustry multiplayer instances and community servers.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
						<LocalLink href={routes.me.servers}>
							<User className="size-3.5 text-muted-foreground" />
							<span>My Servers</span>
						</LocalLink>
					</Button>

					<ClientProtectedElement
						filter
						alt={
							<LoginButton size="sm" className="h-9 gap-1.5 text-xs">
								<Plus className="size-3.5" />
								<Tran text="server.create-server" />
							</LoginButton>
						}
					>
						<Dialog>
							<DialogTrigger asChild>
								<Button size="sm" className="h-9 gap-1.5 text-xs">
									<Plus className="size-3.5" />
									<Tran text="server.create-server" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="server.create-server" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateServerDialog />
							</DialogContent>
						</Dialog>
					</ClientProtectedElement>
				</div>
			</PageHeader>

			{/* Search Toolbar */}
			<div className="flex items-center justify-between gap-2.5">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						className="pl-9 pr-9 h-9 text-sm rounded-lg"
						placeholder="Search by server name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch('')}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
							title="Clear search"
						>
							<X className="size-4" />
						</button>
					)}
				</div>
			</div>

			{/* Server Cards Stream */}
			<ScrollContainer className="flex-1 min-h-0">
				<Suspense
					fallback={
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 12 }).map((_, i) => (
								<ServerCardSkeleton key={i} />
							))}
						</div>
					}
				>
					<InfiniteApiItem
						className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
						queryKey={SERVERS_QUERY_KEY}
						route={api.v4.servers.findAll}
						query={[paginationQuerySchema, { size: 24 }]}
						staleTime={60_000}
						loading={() => (
							<>
								{Array.from({ length: 12 }).map((_, i) => (
									<ServerCardSkeleton key={i} />
								))}
							</>
						)}
					>
						{(pages) => {
							const allServers = pages.flatMap((page) => page);
							const filtered = allServers.filter((server: ServerDto) => {
								if (search.trim()) {
									const q = search.trim().toLowerCase();
									return server.name?.toLowerCase().includes(q);
								}
								return true;
							});

							return filtered.map((server: ServerDto) => (
								<ServerCard key={server.id} server={server} />
							));
						}}
					</InfiniteApiItem>
				</Suspense>
			</ScrollContainer>

			{/* Footer Actions */}
			<PageFooter className="justify-between border-t pt-2.5">
				<div className="flex items-center gap-2">
					<ClientProtectedElement
						filter
						alt={
							<LoginButton variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
								<Settings2 className="size-3.5" />
								<Tran text="server.server-manager" />
							</LoginButton>
						}
					>
						<Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
							<LocalLink href={routes.serverManagers.value}>
								<Settings2 className="size-3.5" />
								<Tran text="server.server-manager" />
							</LocalLink>
						</Button>
					</ClientProtectedElement>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="hidden sm:inline">Mindustry Server Network</span>
				</div>
			</PageFooter>
		</PageWrapper>
	);
}

