'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import type { BroadcastNotificationDto } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { useI18n } from '@/i18n/i18n.client';
import { formatRelativeTime } from '@/components/notification/notification-utils';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export function BroadcastHistoryTable() {
  const { t } = useI18n('notification');
  const queryClient = useQueryClient();

  // History pagination state
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Query broadcast history
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['management', 'notifications', 'history', page],
    queryFn: () =>
      apiInstance.request(api.v4.management.notifications.getHistory, {
        query: { page, size: pageSize },
      }),
  });

  // Delete broadcast mutation
  const [deleteTarget, setDeleteTarget] = useState<BroadcastNotificationDto | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiInstance.request(api.v4.management.notifications.delete, { params: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'notifications', 'history'] });
      toast.success(t('admin.deleteSuccess', { defaultValue: 'Announcement successfully deleted.' }));
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete announcement');
    },
  });

  const totalPages = Math.ceil((historyData?.total ?? 0) / pageSize);

  return (
    <>
      <div className="rounded-lg border border-border/60 bg-background/60 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            {t('admin.history', { defaultValue: 'Broadcast History' })}
          </span>
          {historyData && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {historyData.total} total
            </span>
          )}
        </div>

        {isHistoryLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))}
          </div>
        ) : !historyData || historyData.data.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-muted-foreground border border-dashed rounded-lg">
            {t('admin.noHistory', { defaultValue: 'No broadcast history found.' })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="w-24 font-mono">{t('admin.historyDate', { defaultValue: 'Date' })}</TableHead>
                  <TableHead className="w-28 font-mono">Type</TableHead>
                  <TableHead className="font-mono">{t('admin.historyTitle', { defaultValue: 'Title' })}</TableHead>
                  <TableHead className="font-mono">Message</TableHead>
                  <TableHead className="w-28 font-mono">{t('admin.historyLink', { defaultValue: 'Link' })}</TableHead>
                  <TableHead className="w-12 text-right font-mono">{t('admin.actions', { defaultValue: 'Action' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.data.map((b) => {
                  const p = b.params;
                  return (
                    <TableRow key={b.id} className="border-border/40 hover:bg-muted/15">
                      <TableCell className="whitespace-nowrap font-mono text-muted-foreground text-[11px]">
                        {formatRelativeTime(b.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border/50 bg-muted/30 text-muted-foreground">
                          {b.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {p?.title ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {p?.message ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-30 font-mono text-[11px]">
                        {b.link ? (
                          <a
                            href={b.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground hover:underline"
                          >
                            {b.link}
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title={t('admin.delete', { defaultValue: 'Delete Announcement' })}
                          onClick={() => setDeleteTarget(b)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* History Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 text-xs font-mono">
            <span className="text-muted-foreground text-[11px]">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-6 rounded-md border-border/60"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-6 rounded-md border-border/60"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Broadcast Confirmation Modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">
              {t('admin.deleteConfirmTitle', { defaultValue: 'Delete Announcement?' })}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1 text-xs">
              <p className="text-muted-foreground">
                Permanently remove broadcast notification:
              </p>
              {deleteTarget && (
                <p className="font-medium text-foreground font-mono">
                  &quot;{deleteTarget.params?.title || deleteTarget.code}&quot;
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-xs h-7 rounded-md" disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-7 rounded-md font-mono bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
