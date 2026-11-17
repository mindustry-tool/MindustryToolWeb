'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { NotificationPreferences, UpdateNotificationPreferences } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { useI18n } from '@/i18n/i18n.client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function NotificationSettingsTab() {
  const { t } = useI18n('notification');
  const queryClient = useQueryClient();

  const queryKey = ['notifications', 'preferences'];

  const { data: preferences, isLoading } = useQuery({
    queryKey,
    queryFn: () => apiInstance.request(api.v4.notifications.getPreferences, {}),
  });

  const mutation = useMutation({
    mutationFn: (updates: UpdateNotificationPreferences) =>
      apiInstance.request(api.v4.notifications.updatePreferences, { body: updates }),
    onMutate: async (newUpdates) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(queryKey, {
          ...previous,
          ...newUpdates,
        });
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Failed to update notification preferences');
    },
    onSuccess: () => {
      toast.success(t('preferences.saved', { defaultValue: 'Notification preferences saved.' }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    mutation.mutate({ [key]: value });
  };

  if (isLoading || !preferences) {
    return (
      <div className="space-y-3 p-4 rounded-lg border border-border/40 bg-background/50">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-64" />
        <div className="space-y-3 pt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const inAppDisabled = !preferences.inAppEnabled;

  return (
    <div className="space-y-5">
      {/* Master Toggle */}
      <div className="rounded-lg border border-border/60 bg-background/60 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="pref-in-app" className="text-xs font-semibold text-foreground cursor-pointer">
              {t('preferences.inApp', { defaultValue: 'In-App Notifications' })}
            </Label>
            <p className="text-[11px] text-muted-foreground font-mono">
              {t('preferences.description', { defaultValue: 'Manage how and when you receive in-app alerts.' })}
            </p>
          </div>
          <Switch
            id="pref-in-app"
            checked={preferences.inAppEnabled}
            onCheckedChange={(val) => handleToggle('inAppEnabled', val)}
            disabled={mutation.isPending}
            className="scale-90"
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-lg border border-border/50 bg-background/40 divide-y divide-border/40">
        {/* Header */}
        <div className="px-4 py-2.5 bg-muted/20">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            {t('categories.personal', { defaultValue: 'Alert Preferences' })}
          </span>
        </div>

        {/* Verification */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="pref-verifications"
              className={`text-xs font-medium text-foreground ${inAppDisabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {t('preferences.verification', { defaultValue: 'Content Verification' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('preferences.verificationDesc', {
                defaultValue: 'Alerts when your uploaded items are reviewed or verified.',
              })}
            </p>
          </div>
          <Switch
            id="pref-verifications"
            checked={preferences.verificationEnabled}
            disabled={inAppDisabled || mutation.isPending}
            onCheckedChange={(val) => handleToggle('verificationEnabled', val)}
            className="scale-90"
          />
        </div>

        {/* Likes */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="pref-likes"
              className={`text-xs font-medium text-foreground ${inAppDisabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {t('preferences.likes', { defaultValue: 'Likes & Reactions' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('preferences.likesDesc', {
                defaultValue: 'Alerts when someone likes your published content.',
              })}
            </p>
          </div>
          <Switch
            id="pref-likes"
            checked={preferences.likesEnabled}
            disabled={inAppDisabled || mutation.isPending}
            onCheckedChange={(val) => handleToggle('likesEnabled', val)}
            className="scale-90"
          />
        </div>

        {/* Comments & Replies */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="pref-comments"
              className={`text-xs font-medium text-foreground ${inAppDisabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {t('preferences.comments', { defaultValue: 'Comments & Replies' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('preferences.commentsDesc', {
                defaultValue: 'Alerts when someone comments on your content or replies to your comments.',
              })}
            </p>
          </div>
          <Switch
            id="pref-comments"
            checked={preferences.commentsEnabled}
            disabled={inAppDisabled || mutation.isPending}
            onCheckedChange={(val) => handleToggle('commentsEnabled', val)}
            className="scale-90"
          />
        </div>

        {/* Rewards */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="pref-rewards"
              className={`text-xs font-medium text-foreground ${inAppDisabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {t('preferences.rewards', { defaultValue: 'Rewards & Credits' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('preferences.rewardsDesc', {
                defaultValue: 'Alerts when you earn credits from shared links.',
              })}
            </p>
          </div>
          <Switch
            id="pref-rewards"
            checked={preferences.shareRewardEnabled}
            disabled={inAppDisabled || mutation.isPending}
            onCheckedChange={(val) => handleToggle('shareRewardEnabled', val)}
            className="scale-90"
          />
        </div>

        {/* System Announcements */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="pref-system"
              className={`text-xs font-medium text-foreground ${inAppDisabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {t('preferences.system', { defaultValue: 'System Announcements' })}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {t('preferences.systemDesc', {
                defaultValue: 'Platform updates, alerts, and scheduled maintenance notices.',
              })}
            </p>
          </div>
          <Switch
            id="pref-system"
            checked={preferences.systemEnabled}
            disabled={inAppDisabled || mutation.isPending}
            onCheckedChange={(val) => handleToggle('systemEnabled', val)}
            className="scale-90"
          />
        </div>
      </div>
    </div>
  );
}
