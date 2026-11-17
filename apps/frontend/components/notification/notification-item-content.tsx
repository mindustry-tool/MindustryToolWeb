'use client';

import React from 'react';
import { NotificationDto } from '@mindustry-tool/api';
import { useI18n } from '@/i18n/i18n.client';
import { AlertCircle, AlertTriangle, Info, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemContentProps {
  notification: NotificationDto;
}

export function NotificationItemContent({ notification }: NotificationItemContentProps) {
  const { t } = useI18n('notification');
  const { code, params } = notification;

  let title = '';
  let description = '';
  let tagLabel = '';
  let severityIcon: React.ReactNode = null;
  let tagColorClass = 'bg-muted/60 text-muted-foreground border-border/50';

  switch (code) {
    case 'verification.approved': {
      tagLabel = 'Approved';
      title = t('codes.verification.approved.title', { defaultValue: 'Content Approved' });
      description = t('codes.verification.approved.description', {
        itemType: params.itemType,
        itemName: params.itemName,
        credits: params.credits,
        defaultValue: `Your ${params.itemType} "${params.itemName}" has been verified and approved (+${params.credits} credits).`,
      });
      break;
    }
    case 'verification.rejected': {
      tagLabel = 'Rejected';
      title = t('codes.verification.rejected.title', { defaultValue: 'Content Rejected' });
      description = t('codes.verification.rejected.description', {
        itemType: params.itemType,
        itemName: params.itemName,
        reason: params.reason ? `(${params.reason})` : '',
        defaultValue: params.reason
          ? `Your ${params.itemType} "${params.itemName}" was rejected during review. (${params.reason})`
          : `Your ${params.itemType} "${params.itemName}" was rejected during review.`,
      });
      break;
    }
    case 'like.single': {
      tagLabel = 'Activity';
      title = t('codes.like.single.title', { defaultValue: 'New Like' });
      description = t('codes.like.single.description', {
        actorName: params.actorName,
        itemType: params.itemType,
        itemName: params.itemName,
        defaultValue: `${params.actorName} liked your ${params.itemType} "${params.itemName}".`,
      });
      break;
    }
    case 'like.multiple': {
      tagLabel = 'Activity';
      title = t('codes.like.multiple.title', { defaultValue: 'New Likes' });
      description = t('codes.like.multiple.description', {
        actorName: params.actorName,
        count: params.count,
        itemType: params.itemType,
        itemName: params.itemName,
        defaultValue: `${params.actorName} and ${params.count} others liked your ${params.itemType} "${params.itemName}".`,
      });
      break;
    }
    case 'share_reward': {
      tagLabel = 'Reward';
      title = t('codes.share_reward.title', { defaultValue: 'Share Link Reward' });
      description = t('codes.share_reward.description', {
        credits: params.credits,
        defaultValue: `Your share link earned +${params.credits} credits.`,
      });
      break;
    }
    case 'comment.post': {
      tagLabel = 'Comment';
      tagColorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
      title = t('codes.comment.post.title', { defaultValue: 'New Comment' });
      description = t('codes.comment.post.description', {
        actorName: params.actorName,
        itemType: params.itemType,
        itemName: params.itemName,
        defaultValue: `${params.actorName} commented on your ${params.itemType} "${params.itemName}".`,
      });
      break;
    }
    case 'comment.reply': {
      tagLabel = 'Reply';
      tagColorClass = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25';
      title = t('codes.comment.reply.title', { defaultValue: 'New Reply' });
      description = t('codes.comment.reply.description', {
        actorName: params.actorName,
        itemName: params.itemName,
        defaultValue: `${params.actorName} replied to your comment on "${params.itemName}".`,
      });
      break;
    }
    case 'system.announcement': {
      title = params.title;
      description = params.message;
      if (params.severity === 'alert') {
        tagLabel = 'Alert';
        severityIcon = <AlertCircle className="size-3 text-destructive shrink-0" />;
        tagColorClass = 'bg-destructive/10 text-destructive border-destructive/25';
      } else if (params.severity === 'warning') {
        tagLabel = 'Warning';
        severityIcon = <AlertTriangle className="size-3 text-amber-500 shrink-0" />;
        tagColorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      } else {
        tagLabel = 'Info';
        severityIcon = <Info className="size-3 text-sky-500 shrink-0" />;
        tagColorClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25';
      }
      break;
    }
    case 'system.maintenance': {
      tagLabel = 'Maintenance';
      severityIcon = <Wrench className="size-3 text-amber-500 shrink-0" />;
      tagColorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      title = params.title;
      description = params.message;
      break;
    }
    default: {
      tagLabel = 'Notice';
      title = code;
      description = typeof params === 'string' ? params : JSON.stringify(params);
      break;
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full min-w-0">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tight uppercase border',
            tagColorClass,
          )}
        >
          {severityIcon}
          {tagLabel}
        </span>
        <span className="text-xs font-medium text-foreground tracking-tight truncate">
          {title}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
        {description}
      </p>
      {'contentSnippet' in params && Boolean(params.contentSnippet) && (
        <p className="text-[11px] text-muted-foreground/80 italic line-clamp-1 border-l-2 border-border/80 pl-2 mt-0.5">
          &quot;{String(params.contentSnippet)}&quot;
        </p>
      )}
    </div>
  );
}
