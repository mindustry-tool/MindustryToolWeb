'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import type { AdminCreateNotification, AdminTarget, NotificationDto } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { useI18n } from '@/i18n/i18n.client';
import { NotificationItemContent } from '@/components/notification/notification-item-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Loader2,
  Info,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function BroadcastComposer() {
  const { t } = useI18n('notification');
  const queryClient = useQueryClient();

  // Form states
  const [target, setTarget] = useState<AdminTarget>('all');
  const [targetId, setTargetId] = useState('');
  const [code, setCode] = useState<'system.announcement' | 'system.maintenance'>('system.announcement');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'alert'>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Query roles for role selector
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiInstance.request(api.v4.roles.findAll, {}),
    enabled: target === 'role',
  });

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (body: AdminCreateNotification) =>
      apiInstance.request(api.v4.management.notifications.broadcast, { body }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });
      toast.success(t('admin.sentSuccess', { defaultValue: 'Announcement successfully broadcasted!' }), {
        description: `Delivered to ${res.sentCount} active client(s).`,
      });
      setTitle('');
      setMessage('');
      setLink('');
      setTargetId('');
      setConfirmOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to broadcast notification');
    },
  });

  // Handle submit confirmation
  const handleConfirmSend = () => {
    const payload: AdminCreateNotification = {
      target,
      targetId: target !== 'all' ? targetId.trim() : undefined,
      code,
      params: {
        title: title.trim(),
        message: message.trim(),
        ...(code === 'system.announcement' ? { severity } : {}),
        ...(link.trim() ? { link: link.trim() } : {}),
      },
      link: link.trim() ? link.trim() : undefined,
    };

    broadcastMutation.mutate(payload);
  };

  const isFormValid =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    (target === 'all' || targetId.trim().length > 0);

  // Live preview NotificationDto
  const previewNotification: NotificationDto =
    code === 'system.announcement'
      ? {
          id: 'preview-id',
          userId: 'admin',
          category: 'system',
          code: 'system.announcement',
          params: {
            title: title.trim() || 'Announcement Title Preview',
            message:
              message.trim() ||
              'This is how the announcement message will look to users when received in the inbox or preview dropdown.',
            severity,
            link: link.trim() || undefined,
          },
          groupKey: 'system:broadcast',
          aggregationKey: null,
          link: link.trim() || null,
          readAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : {
          id: 'preview-id',
          userId: 'admin',
          category: 'system',
          code: 'system.maintenance',
          params: {
            title: title.trim() || 'Maintenance Notice Preview',
            message:
              message.trim() ||
              'Scheduled maintenance will take place soon.',
          },
          groupKey: 'system:broadcast',
          aggregationKey: null,
          link: link.trim() || null,
          readAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Composer (7 cols) */}
        <div className="lg:col-span-7 rounded-lg border border-border/60 bg-background/60 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              {t('admin.send', { defaultValue: 'Compose Broadcast' })}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Admin Console</span>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              {t('admin.target', { defaultValue: 'Target Audience' })}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors cursor-pointer',
                  target === 'all'
                    ? 'border-foreground bg-muted/50 text-foreground'
                    : 'border-border/60 bg-background/40 text-muted-foreground hover:bg-muted/20 hover:text-foreground',
                )}
              >
                <span className="text-xs font-medium text-foreground">
                  {t('admin.targetAll', { defaultValue: 'All Users' })}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5">Broadcast</span>
              </button>
              <button
                type="button"
                onClick={() => setTarget('user')}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors cursor-pointer',
                  target === 'user'
                    ? 'border-foreground bg-muted/50 text-foreground'
                    : 'border-border/60 bg-background/40 text-muted-foreground hover:bg-muted/20 hover:text-foreground',
                )}
              >
                <span className="text-xs font-medium text-foreground">
                  {t('admin.targetUser', { defaultValue: 'Specific User' })}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5">Direct alert</span>
              </button>
              <button
                type="button"
                onClick={() => setTarget('role')}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors cursor-pointer',
                  target === 'role'
                    ? 'border-foreground bg-muted/50 text-foreground'
                    : 'border-border/60 bg-background/40 text-muted-foreground hover:bg-muted/20 hover:text-foreground',
                )}
              >
                <span className="text-xs font-medium text-foreground">
                  {t('admin.targetRole', { defaultValue: 'Specific Role' })}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5">By role filter</span>
              </button>
            </div>

            {/* Conditional Target ID selector */}
            {target === 'user' && (
              <div className="space-y-1 pt-1">
                <Label htmlFor="user-id" className="text-[11px] text-muted-foreground font-mono">
                  Target User ID (UUID)
                </Label>
                <Input
                  id="user-id"
                  placeholder="User UUID..."
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="text-xs h-8 rounded-md font-mono"
                />
              </div>
            )}

            {target === 'role' && (
              <div className="space-y-1 pt-1">
                <Label htmlFor="role-id" className="text-[11px] text-muted-foreground font-mono">
                  Target Role
                </Label>
                {roles ? (
                  <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger className="text-xs h-8 rounded-md font-mono">
                      <SelectValue placeholder="Select target role..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id} className="text-xs font-mono">
                          {role.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="role-id"
                    placeholder="Role ID..."
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="text-xs h-8 rounded-md font-mono"
                  />
                )}
              </div>
            )}
          </div>

          {/* Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Type</Label>
              <Select
                value={code}
                onValueChange={(val) => setCode(val as 'system.announcement' | 'system.maintenance')}
              >
                <SelectTrigger className="text-xs h-8 rounded-md font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="system.announcement" className="text-xs">
                    Announcement
                  </SelectItem>
                  <SelectItem value="system.maintenance" className="text-xs">
                    Maintenance Notice
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {code === 'system.announcement' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t('admin.severity', { defaultValue: 'Severity' })}
                </Label>
                <Select
                  value={severity}
                  onValueChange={(val) => setSeverity(val as 'info' | 'warning' | 'alert')}
                >
                  <SelectTrigger className="text-xs h-8 rounded-md font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="info" className="text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <Info className="size-3 text-sky-500" />
                        <span>info</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="warning" className="text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="size-3 text-amber-500" />
                        <span>warning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="alert" className="text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="size-3 text-destructive" />
                        <span>alert</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title" className="text-xs font-medium text-foreground">
              {t('admin.subject', { defaultValue: 'Title' })}
            </Label>
            <Input
              id="announcement-title"
              placeholder={t('admin.subjectPlaceholder', { defaultValue: 'Enter title...' })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="text-xs h-8 rounded-md"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-message" className="text-xs font-medium text-foreground">
              {t('admin.message', { defaultValue: 'Message' })}
            </Label>
            <Textarea
              id="announcement-message"
              placeholder={t('admin.messagePlaceholder', { defaultValue: 'Write notification message...' })}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              className="text-xs rounded-md resize-none"
            />
          </div>

          {/* Action Link */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-link" className="text-xs font-medium text-foreground">
              {t('admin.link', { defaultValue: 'Action Link (Optional)' })}
            </Label>
            <Input
              id="announcement-link"
              placeholder={t('admin.linkPlaceholder', { defaultValue: '/schematics/... or https://...' })}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="text-xs h-8 rounded-md font-mono"
            />
          </div>

          {/* Submit Button */}
          <Button
            disabled={!isFormValid || broadcastMutation.isPending}
            onClick={() => setConfirmOpen(true)}
            className="w-full text-xs font-medium h-8 rounded-md font-mono"
          >
            {broadcastMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                {t('admin.sending', { defaultValue: 'Broadcasting...' })}
              </>
            ) : (
              t('admin.send', { defaultValue: 'Broadcast Announcement' })
            )}
          </Button>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {t('admin.livePreview', { defaultValue: 'Preview' })}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Real-time mock</span>
            </div>

            {/* Preview Container */}
            <div className="rounded-lg border border-border/50 bg-background/80 p-3 space-y-2">
              <NotificationItemContent notification={previewNotification} />
              {link.trim() && (
                <div className="pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground truncate">
                  ↳ {link.trim()}
                </div>
              )}
            </div>
          </div>

          {/* Target Audience Summary card */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Audience</span>
              <span className="text-foreground capitalize">
                {target === 'all'
                  ? 'All Users'
                  : `${target}: ${targetId || '—'}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Severity</span>
              <span className="flex items-center gap-1.5 capitalize font-medium">
                {severity === 'alert' && <AlertCircle className="size-3 text-destructive" />}
                {severity === 'warning' && <AlertTriangle className="size-3 text-amber-500" />}
                {severity === 'info' && <Info className="size-3 text-sky-500" />}
                <span
                  className={cn(
                    severity === 'alert'
                      ? 'text-destructive'
                      : severity === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-sky-600 dark:text-sky-400',
                  )}
                >
                  {severity}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Transport</span>
              <span className="text-foreground">SSE + Database</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">
              Confirm Broadcast
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1 text-xs">
              <p>
                Broadcast <strong>&quot;{title}&quot;</strong> to{' '}
                <span className="font-semibold text-foreground font-mono">
                  {target === 'all'
                    ? 'ALL users'
                    : `${target}: ${targetId}`}
                </span>
                .
              </p>
              <p className="text-muted-foreground font-mono text-[11px]">
                Pushed immediately via real-time SSE.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-xs h-7 rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-7 rounded-md font-medium font-mono"
              onClick={handleConfirmSend}
              disabled={broadcastMutation.isPending}
            >
              {broadcastMutation.isPending ? 'Broadcasting...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
