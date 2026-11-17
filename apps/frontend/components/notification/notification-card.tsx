'use client';

import React from 'react';
import { NotificationDto } from '@mindustry-tool/api';
import { NotificationItemContent } from './notification-item-content';
import { formatRelativeTime, getNotificationLink } from './notification-utils';
import { LocalLink } from '@/components/common/locale-link';
import { Button } from '@/components/ui/button';
import { Check, Trash2, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: NotificationDto;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const { t } = useI18n('notification');
  const isUnread = !notification.readAt;
  const link = getNotificationLink(notification);

  const handleCardClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-colors',
        isUnread
          ? 'bg-muted/30 border-border/80 text-foreground'
          : 'bg-background/60 border-border/40 text-muted-foreground hover:bg-muted/15 hover:border-border/60',
      )}
    >
      {/* Unread indicator line */}
      {isUnread && (
        <span
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-foreground"
          title={t('unread')}
        />
      )}

      {/* Main content */}
      <div className={cn('flex-1 min-w-0', isUnread ? 'pl-2' : '')}>
        <NotificationItemContent notification={notification} />
      </div>

      {/* Footer / Meta & Actions */}
      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 text-xs">
        <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(notification.createdAt)}
        </span>

        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isUnread && onMarkRead && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              title={t('markAsRead', { defaultValue: 'Mark as read' })}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              <Check className="size-3.5" />
            </Button>
          )}

          {link && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              asChild
            >
              <LocalLink href={link} onClick={handleCardClick}>
                <ArrowUpRight className="size-3.5" />
              </LocalLink>
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              title={t('delete', { defaultValue: 'Delete' })}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
