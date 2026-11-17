import type { NotificationDto } from '@mindustry-tool/api';

export function formatRelativeTime(dateStr: string): string {
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

export function getNotificationLink(notification: NotificationDto): string | null {
  if (notification.link) {
    return notification.link;
  }

  const { code, params } = notification;

  if (code === 'comment.post' || code === 'comment.reply') {
    const itemType = params.itemType;
    const itemId = params.itemId;
    const commentId = params.commentId;
    if (!itemId) return null;
    const base = itemType.endsWith('s') ? `/${itemType}/${itemId}` : `/${itemType}s/${itemId}`;
    return commentId ? `${base}?commentId=${commentId}` : base;
  }

  if (code === 'system.announcement') {
    return params.link ?? null;
  }

  if (code === 'verification.approved' || code === 'verification.rejected') {
    const itemType = params.itemType;
    const itemId = params.itemId;
    if (!itemId) return null;
    if (itemType === 'schematic') return `/schematics/${itemId}`;
    if (itemType === 'map') return `/maps/${itemId}`;
    if (itemType === 'mod') return `/mods/${itemId}`;
    if (itemType === 'content-patch') return `/content-patches/${itemId}`;
    if (itemType === 'post') return `/posts/${itemId}`;
  }

  if (code === 'like.single' || code === 'like.multiple') {
    const itemType = params.itemType;
    const itemId = params.itemId;
    if (!itemId) return null;
    if (itemType === 'schematic') return `/schematics/${itemId}`;
    if (itemType === 'map') return `/maps/${itemId}`;
    if (itemType === 'mod') return `/mods/${itemId}`;
    if (itemType === 'content-patch') return `/content-patches/${itemId}`;
    if (itemType === 'post') return `/posts/${itemId}`;
  }

  return null;
}

export function parseGroupKey(groupKey?: string | null): { entityType: string; entityId: string } | null {
  if (!groupKey) return null;
  const colonIndex = groupKey.indexOf(':');
  if (colonIndex === -1) return null;
  return {
    entityType: groupKey.slice(0, colonIndex),
    entityId: groupKey.slice(colonIndex + 1),
  };
}
