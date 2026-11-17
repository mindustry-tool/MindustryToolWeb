'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { NotificationDto } from '@mindustry-tool/api';
import useSse from '@/hooks/use-sse';
import { useSession } from '@/hooks/use-session';
import { toast } from 'sonner';
import { NotificationItemContent } from '@/components/notification/notification-item-content';

export function useNotificationSse() {
  const { state } = useSession();
  const queryClient = useQueryClient();

  const isAuth = state === 'authenticated';

  const { state: sseState } = useSse({
    route: api.v4.notifications.sse,
    enabled: isAuth,
    onEvent: (data) => {
      const notification: NotificationDto = data.notification;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Optimistically update unread count
      queryClient.setQueryData(['notifications', 'unread-count'], (old: { count: number } | undefined) => {
        return { count: (old?.count ?? 0) + 1 };
      });

      // Show toast alert
      toast(<NotificationItemContent notification={notification} />, {
        duration: 5000,
      });
    },
  });

  return { sseState };
}
