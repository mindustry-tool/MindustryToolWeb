import { DEFAULT_SORT_TAG, SortTag } from '@mindustry-tool/api';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

const SORT_MAP = {
  'download-count_desc': {
    downloads: 'desc',
  },
  like_desc: {
    likes: 'desc',
  },
  time_desc: {
    item: {
      createdAt: 'desc',
    },
  },
  time_asc: {
    item: {
      createdAt: 'asc',
    },
  },
} as const satisfies Record<SortTag, unknown>;

export function mapSort(sort?: SortTag | null) {
  if (!sort) {
    return SORT_MAP[DEFAULT_SORT_TAG];
  }

  const value = SORT_MAP[sort];

  if (value === undefined) {
    throw new BadRequestException('Invalid sort: ' + sort);
  }

  return value;
}

export function getRealIp(request: Request): string {
  const cfIp = request.headers['cf-connecting-ip'];

  if (cfIp) {
    return Array.isArray(cfIp) ? cfIp[0] : cfIp;
  }

  const xff = request.headers['x-forwarded-for'];

  if (xff) {
    const value = Array.isArray(xff) ? xff[0] : xff;
    return value.split(',')[0].trim();
  }

  return request.ip || 'Unknown';
}

export function getMetricId(request: Request): string | undefined {
  const metricId =
    request.cookies?.['mid'] ||
    (request.headers['mid'] as string | undefined) ||
    (request.headers['x-mid'] as string | undefined);

  return typeof metricId === 'string' && metricId.length > 0 ? metricId : undefined;
}

export function getClientFromMetricId(metricId: string): 'web' | 'mod' | 'unknown' {
  if (metricId.startsWith('mod:')) {
    return 'mod';
  }
  if (metricId.startsWith('web:')) {
    return 'web';
  }
  return 'unknown';
}

