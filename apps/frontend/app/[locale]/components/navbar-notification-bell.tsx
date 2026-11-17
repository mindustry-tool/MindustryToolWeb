'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { NotificationDto } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { useSession } from '@/hooks/use-session';
import { useNotificationSse } from '@/hooks/use-notification-sse';
import { useI18n } from '@/i18n/i18n.client';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, ChevronRight, Loader2 } from 'lucide-react';
import { NotificationItemContent } from '@/components/notification/notification-item-content';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NavbarNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useSession();
  const { t } = useI18n('notification');
  const queryClient = useQueryClient();

  // Connect SSE
  useNotificationSse();

  const isAuth = state === 'authenticated';

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiInstance.request(api.v4.notifications.getUnreadCount, {}),
    enabled: isAuth,
    refetchInterval: 60000,
  });

  const { data: recentData, isLoading: isRecentLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => apiInstance.request(api.v4.notifications.findAll, { query: { size: 5 } }),
    enabled: isAuth && isOpen,
  });

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
    },
  });

  if (!isAuth) {
    return null;
  }

  const unreadCount = unreadData?.count ?? 0;
  const notifications: NotificationDto[] = recentData?.data ?? [];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground rounded-lg size-8.5"
          aria-label={t('title', { defaultValue: 'Notifications' })}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-md rounded-lg border border-border/70 bg-popover text-popover-foreground overflow-hidden z-50"
      >
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">{t('title', { defaultValue: 'Notifications' })}</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground border border-border/50">
                {unreadCount} {t('unread', { defaultValue: 'unread' })}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2 rounded text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="size-3 mr-1" />
              <span>{t('markAllAsRead', { defaultValue: 'Mark all read' })}</span>
            </Button>
          )}
        </div>

        <div className="max-h-90 overflow-y-auto divide-y divide-border/40">
          {isRecentLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              {t('empty', { defaultValue: 'No notifications' })}
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.readAt;
              const content = (
                <div
                  key={n.id}
                  onClick={() => {
                    if (isUnread) {
                      markAsReadMutation.mutate(n.id);
                    }
                    if (n.link) {
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isUnread ? 'bg-muted/25 hover:bg-muted/40' : 'hover:bg-muted/15'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <NotificationItemContent notification={n} />
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
                      <span>{formatRelativeTime(n.createdAt)}</span>
                      {isUnread && (
                        <span className="inline-block size-1 rounded-full bg-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );

              return n.link ? (
                <LocalLink href={n.link} key={n.id} className="block no-underline">
                  {content}
                </LocalLink>
              ) : (
                content
              );
            })
          )}
        </div>

        <div className="p-1.5 border-t border-border/50 bg-muted/10 text-center">
          <LocalLink
            href={routes.notification}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{t('viewAll', { defaultValue: 'View all' })}</span>
            <ChevronRight className="size-3" />
          </LocalLink>
        </div>
      </PopoverContent>
    </Popover>
  );
}
