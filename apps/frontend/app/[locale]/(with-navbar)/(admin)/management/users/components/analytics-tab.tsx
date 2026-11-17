'use client';

import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import ScrollContainer from '@/components/common/scroll-container';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const cards = [
  { key: 'daily' as const, label: 'Daily', window: 'Last 24 hours' },
  { key: 'weekly' as const, label: 'Weekly', window: 'Last 7 days' },
  { key: 'monthly' as const, label: 'Monthly', window: 'Last 30 days' },
];

function countByDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function AnalyticsTab() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['stats', 'visits'],
    queryFn: () =>
      apiInstance.request(api.v4.stats.visits, {
        query: {
          start: countByDateRange(30).start.toISOString(),
          end: new Date().toISOString(),
        },
      }),
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-destructive p-4">
        <p className="text-sm">
          <Tran text="user.error-loading-analytics" />
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
		<ScrollContainer className="flex-1 flex items-center">
			<div className="p-4 sm:p-6 space-y-4 max-w-5xl container">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold text-foreground">
							<Tran text="user.analytics" />
						</h2>
						<p className="text-xs text-muted-foreground">Unique visitor traffic by client</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isFetching}
						className="h-8 text-xs gap-1.5"
					>
						<RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
						<span>Refresh</span>
					</Button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{cards.map((card) => {
						const intervalData = data?.[card.key];
						const total = intervalData?.total ?? 0;
						const web = intervalData?.web ?? 0;
						const mod = intervalData?.mod ?? 0;
						const unknown = intervalData?.unknown ?? 0;

						return (
							<div
								key={card.key}
								className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between gap-4"
							>
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-foreground">{card.label}</span>
										<span className="text-xs text-muted-foreground">{card.window}</span>
									</div>

									<div className="mt-3">
										{isLoading ? (
											<Skeleton className="h-9 w-24" />
										) : (
											<div className="text-3xl font-bold tabular-nums text-foreground">{total.toLocaleString()}</div>
										)}
										<div className="text-xs text-muted-foreground mt-0.5">Total visitors</div>
									</div>
								</div>

								<div className="pt-3 border-t border-border/60 space-y-2 text-xs">
									<div className="flex items-center justify-between text-muted-foreground">
										<span>Web</span>
										{isLoading ? (
											<Skeleton className="h-4 w-10" />
										) : (
											<span className="font-mono font-medium text-foreground tabular-nums">{web.toLocaleString()}</span>
										)}
									</div>
									<div className="flex items-center justify-between text-muted-foreground">
										<span>Mod</span>
										{isLoading ? (
											<Skeleton className="h-4 w-10" />
										) : (
											<span className="font-mono font-medium text-foreground tabular-nums">{mod.toLocaleString()}</span>
										)}
									</div>
									<div className="flex items-center justify-between text-muted-foreground">
										<span>Unknown</span>
										{isLoading ? (
											<Skeleton className="h-4 w-10" />
										) : (
											<span className="font-mono font-medium text-foreground tabular-nums">{unknown.toLocaleString()}</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</ScrollContainer>
	);
}
