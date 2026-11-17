'use client';

import React from 'react';
import { PageWrapper } from '@/components/common/page-wrapper';
import ProtectedRoute from '@/components/layout/protected-route';
import { useI18n } from '@/i18n/i18n.client';
import { BroadcastComposer } from './components/broadcast-composer';
import { BroadcastHistoryTable } from './components/broadcast-history-table';

export default function AdminNotificationPage() {
  const { t } = useI18n('notification');

  return (
    <ProtectedRoute filter="notification:manage">
      <PageWrapper className="max-w-5xl mx-auto w-full py-6 px-4 space-y-6">
        {/* Header */}
        <div className="border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {t('admin.title', { defaultValue: 'Notification Management' })}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {t('admin.description', { defaultValue: 'Compose and broadcast system announcements to users.' })}
            </p>
          </div>
        </div>

        {/* 2-Column Section: Composer Form & Live Preview */}
        <BroadcastComposer />

        {/* Broadcast History Table */}
        <BroadcastHistoryTable />
      </PageWrapper>
    </ProtectedRoute>
  );
}
