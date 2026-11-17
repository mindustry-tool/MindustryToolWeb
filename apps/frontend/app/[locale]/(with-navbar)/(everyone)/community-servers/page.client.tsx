'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@mindustry-tool/api';
import { type CommunityServerDto } from '@mindustry-tool/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, X, Loader2 } from 'lucide-react';
import { apiInstance } from '@/config/api';
import {
  CommunityServerCard,
  CommunityServerCardSkeleton,
} from '@/components/community-server/community-server-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollContainer from '@/components/common/scroll-container';
import { PageFooter, PageWrapper } from '@/components/common/page-wrapper';

export function PageClient() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [channel, setChannel] = useState<'all' | 'v8' | 'be'>('v8');
  const [sort, setSort] = useState<'players' | 'name'>('players');

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const activeChannel = channel === 'all' ? undefined : channel;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      'community-servers',
      {
        search: debouncedSearch.trim() || undefined,
        channel: activeChannel,
        sort,
      },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const [res] = await apiInstance.tryRequest(api.v4.communityServers.findAll, {
        query: {
          page: pageParam,
          size: 40,
          search: debouncedSearch.trim() || undefined,
          channel: activeChannel,
          sort,
        },
      });
      return res ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 40) return undefined;
      return allPages.length;
    },
    refetchOnWindowFocus: 'always',
  });

  const allServers = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  // Group servers by their CommunityServerGroup
  const groupedServers = useMemo(() => {
    const map = new Map<string, CommunityServerDto[]>();
    for (const server of allServers) {
      const gName = server.groupName || 'Other';
      const list = map.get(gName) || [];
      list.push(server);
      map.set(gName, list);
    }

    const groups = Array.from(map.entries()).map(([groupName, servers]) => {
      // Sort servers within group: online first, players desc, cleanName asc
      servers.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        if (b.players !== a.players) return b.players - a.players;
        return (a.cleanName || a.address).localeCompare(b.cleanName || b.address);
      });

      const first = servers[0];
      // Server-side computed totals across the whole group, not truncated by pagination
      const totalPlayers =
        first?.groupTotalPlayers ??
        servers.filter((s) => s.isOnline && !s.isHub).reduce((acc, s) => acc + s.players, 0);
      const serverCount = first?.groupServerCount ?? servers.length;
      return {
        groupName,
        servers,
        totalPlayers,
        serverCount,
      };
    });

    // Always sort groups by ServerGroup attributes
    groups.sort((a, b) => {
      if (sort === 'name') {
        return a.groupName.localeCompare(b.groupName);
      }
      if (b.totalPlayers !== a.totalPlayers) {
        return b.totalPlayers - a.totalPlayers;
      }
      return a.groupName.localeCompare(b.groupName);
    });

    return groups;
  }, [allServers, sort]);

  // IntersectionObserver for infinite scroll sentinel
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PageWrapper className="gap-3 p-3 sm:p-4">
      {/* Minimal Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-border/40">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 pr-8 h-8 text-xs rounded-md bg-muted/30"
            placeholder="Search servers, groups, addresses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
              title="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Channel Tabs & Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Tabs
            value={channel}
            onValueChange={(val) => setChannel(val as 'all' | 'v8' | 'be')}
          >
            <TabsList>
              <TabsTrigger value="all" className="text-xs px-2.5">
                All
              </TabsTrigger>
              <TabsTrigger value="v8" className="text-xs px-2.5">
                v8
              </TabsTrigger>
              <TabsTrigger value="be" className="text-xs px-2.5">
                BE
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={sort}
            onValueChange={(v) => setSort(v as 'players' | 'name')}
          >
            <SelectTrigger className="h-8 text-xs w-27.5 rounded-md">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="players" className="text-xs">
                Players
              </SelectItem>
              <SelectItem value="name" className="text-xs">
                Name
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content: Grouped Single-Row List */}
      <ScrollContainer className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-6 sm:space-y-7">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="flex items-center justify-between pb-2 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-8 bg-muted/60 rounded" />
                    <div className="h-5 w-36 bg-muted/70 rounded" />
                  </div>
                  <div className="h-4 w-28 bg-muted/50 rounded" />
                </div>
                <div className="space-y-1.5">
                  <CommunityServerCardSkeleton />
                  <CommunityServerCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : groupedServers.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xs">
            No servers matching criteria.
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-7">
            {groupedServers.map((group, index) => (
              <section key={group.groupName} className="space-y-2">
                {/* Distinct Group Header with Rank */}
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                      #{index + 1}
                    </span>
                    <h2 className="font-semibold text-base sm:text-lg text-foreground tracking-tight truncate">
                      {group.groupName}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 ml-3">
                    {group.serverCount} {group.serverCount === 1 ? 'server' : 'servers'}
                    {group.totalPlayers > 0 && ` · ${group.totalPlayers} players`}
                  </span>
                </div>

                {/* Single-Column Stack of Server Cards (1 per row) */}
                <div className="space-y-1.5">
                  {group.servers.map((server) => (
                    <CommunityServerCard key={server.id} server={server} />
                  ))}
                </div>
              </section>
            ))}

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="py-3 flex justify-center text-muted-foreground text-xs">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Loading more...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-[11px] text-muted-foreground/50">Scroll for more</span>
              ) : (
                <span className="text-[11px] text-muted-foreground/40">End of list</span>
              )}
            </div>
          </div>
        )}
      </ScrollContainer>

      {/* Minimal Footer */}
      <PageFooter className="justify-between border-t pt-2 text-[11px] text-muted-foreground/60">
        <span>Official Mindustry List</span>
        <span className="font-mono">{allServers.length} servers loaded</span>
      </PageFooter>
    </PageWrapper>
  );
}
