'use client';

import React, { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { NotificationDto } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { PageWrapper } from '@/components/common/page-wrapper';
import ProtectedRoute from '@/components/layout/protected-route';
import { useI18n } from '@/i18n/i18n.client';
import { NotificationCard } from '@/components/notification/notification-card';
import { parseGroupKey } from '@/components/notification/notification-utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type NotificationCategory = 'personal' | 'system';

export default function NotificationsPage() {
  const { t } = useI18n('notification');
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<NotificationCategory>('personal');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);

  // Unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiInstance.request(api.v4.notifications.getUnreadCount, {}),
  });
  const unreadCount = unreadData?.count ?? 0;

  // Infinite notifications list
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['notifications', 'list', category, unreadOnly],
    queryFn: ({ pageParam }) =>
      apiInstance.request(api.v4.notifications.findAll, {
        query: {
          size: 20,
          cursor: pageParam,
          category,
          unreadOnly: unreadOnly ? true : undefined,
        },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiInstance.request(api.v4.notifications.markAsRead, { params: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiInstance.request(api.v4.notifications.markAllAsRead, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('markAllAsRead', { defaultValue: 'Marked all as read' }));
    },
  });

  const clearReadMutation = useMutation({
    mutationFn: () => apiInstance.request(api.v4.notifications.clearRead, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('clearRead', { defaultValue: 'Cleared read notifications' }), {
        description: `${res.count} notifications removed.`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiInstance.request(api.v4.notifications.delete, { params: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Flattened notifications
  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Presentation grouping by groupKey
  const { groupedList, ungroupedList } = useMemo(() => {
    if (!isGrouped) {
      return { groupedList: [], ungroupedList: allNotifications };
    }

    const groupsMap = new Map<string, NotificationDto[]>();
    const ungrouped: NotificationDto[] = [];

    for (const item of allNotifications) {
      if (item.groupKey) {
        const existing = groupsMap.get(item.groupKey) ?? [];
        existing.push(item);
        groupsMap.set(item.groupKey, existing);
      } else {
        ungrouped.push(item);
      }
    }

    const groups = Array.from(groupsMap.entries()).map(([key, items]) => ({
      groupKey: key,
      parsed: parseGroupKey(key),
      items,
    }));

    return { groupedList: groups, ungroupedList: ungrouped };
  }, [allNotifications, isGrouped]);



  return (
    <ProtectedRoute filter={true}>
      <PageWrapper className="max-w-4xl mx-auto w-full py-6 px-4 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {t('title', { defaultValue: 'Notifications' })}
              </h1>
              {unreadCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-foreground text-background font-medium">
                  {unreadCount} {t('unread', { defaultValue: 'unread' })}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {t('preferences.description', { defaultValue: 'Manage activity alerts and system notices.' })}
            </p>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs h-7 rounded-md border-border/60 hover:bg-muted/40"
            >
              {markAllAsReadMutation.isPending && (
                <Loader2 className="size-3 animate-spin mr-1.5" />
              )}
              {t('markAllAsRead', { defaultValue: 'Mark all as read' })}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={allNotifications.length === 0 || clearReadMutation.isPending}
              onClick={() => clearReadMutation.mutate()}
              className="text-xs h-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              {clearReadMutation.isPending && (
                <Loader2 className="size-3 animate-spin mr-1.5" />
              )}
              {t('clearRead', { defaultValue: 'Clear read' })}
            </Button>
          </div>
        </div>

        {/* Controls: Segmented View & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <Tabs
            value={category}
            onValueChange={(val) => setCategory(val as NotificationCategory)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-auto rounded-md bg-muted/40 border border-border/50">
              <TabsTrigger value="personal" className="text-xs py-1 px-3 font-medium">
                {t('categories.personal', { defaultValue: 'Personal' })}
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs py-1 px-3 font-medium">
                {t('categories.system', { defaultValue: 'System' })}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters & Toggles */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            {/* Unread only */}
            <div className="flex items-center gap-1.5">
              <Switch
                id="unread-only"
                checked={unreadOnly}
                onCheckedChange={setUnreadOnly}
                className="scale-90"
              />
              <Label htmlFor="unread-only" className="text-xs text-muted-foreground cursor-pointer select-none">
                {t('unreadOnly', { defaultValue: 'Unread only' })}
              </Label>
            </div>

            {/* Grouping switch */}
            <div className="flex items-center gap-1.5">
              <Switch
                id="group-by-entity"
                checked={isGrouped}
                onCheckedChange={setIsGrouped}
                className="scale-90"
              />
              <Label htmlFor="group-by-entity" className="text-xs text-muted-foreground cursor-pointer select-none">
                {t('groupByEntity', { defaultValue: 'Grouped' })}
              </Label>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="space-y-2 min-h-65">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-border/40 bg-background/50">
              <p className="text-xs font-medium text-foreground">
                {t('empty', { defaultValue: 'No notifications' })}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5 max-w-xs">
                {unreadOnly
                  ? t('allCaughtUp', { defaultValue: 'All caught up' })
                  : category === 'personal'
                    ? t('emptyPersonal', { defaultValue: 'No personal alerts' })
                    : t('emptySystem', { defaultValue: 'No system announcements' })}
              </p>
            </div>
          ) : isGrouped ? (
            /* Grouped View */
            <div className="space-y-4">
              {groupedList.map((group) => {
                const sampleParam = group.items[0]?.params as any;
                const entityName = sampleParam?.itemName || sampleParam?.title;
                return (
                  <div
                    key={group.groupKey}
                    className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-muted-foreground uppercase text-[10px]">
                          {group.parsed?.entityType ?? 'Group'}:
                        </span>
                        <span className="text-foreground text-xs truncate max-w-60 sm:max-w-sm">
                          {entityName || group.parsed?.entityId || group.groupKey}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                        {group.items.length}
                      </span>
                    </div>

                    {/* Group Items */}
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <NotificationCard
                          key={item.id}
                          notification={item}
                          onMarkRead={(id) => markAsReadMutation.mutate(id)}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Ungrouped items */}
              {ungroupedList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {groupedList.length > 0 && (
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                      {t('tabs.all', { defaultValue: 'Other' })}
                    </div>
                  )}
                  {ungroupedList.map((item) => (
                    <NotificationCard
                      key={item.id}
                      notification={item}
                      onMarkRead={(id) => markAsReadMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Flat view */
            <div className="space-y-1.5">
              {allNotifications.map((item) => (
                <NotificationCard
                  key={item.id}
                  notification={item}
                  onMarkRead={(id) => markAsReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-xs h-7 rounded-md border-border/60 font-mono"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                    {t('loading', { defaultValue: 'Loading...' })}
                  </>
                ) : (
                  t('loadMore', { defaultValue: 'Load more' })
                )}
              </Button>
            </div>
          )}
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
