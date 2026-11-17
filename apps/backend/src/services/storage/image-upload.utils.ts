import { BadRequestException } from '@nestjs/common';
import { imageSize } from 'image-size';
import { v7 as uuidv7 } from 'uuid';

export type UploadImageExtension = 'png' | 'jpg' | 'webp';
export type UploadImageFormat = 'png' | 'jpeg' | 'webp';

export interface UploadImageDetection {
  extension: UploadImageExtension;
  format: UploadImageFormat;
  mimeType: string;
  contentType: string;
}

const PNG_METADATA = {
  extension: 'png',
  format: 'png',
  mimeType: 'image/png',
  contentType: 'image/png',
} as const satisfies UploadImageDetection;

const JPEG_METADATA = {
  extension: 'jpg',
  format: 'jpeg',
  mimeType: 'image/jpeg',
  contentType: 'image/jpeg',
} as const satisfies UploadImageDetection;

const WEBP_METADATA = {
  extension: 'webp',
  format: 'webp',
  mimeType: 'image/webp',
  contentType: 'image/webp',
} as const satisfies UploadImageDetection;

export function detectUploadImage(buffer: Buffer): UploadImageDetection {
  let type: string | undefined;
  try {
    type = imageSize(buffer).type;
  } catch {
    throw new BadRequestException('Unsupported image type: unknown. Only png, jpg, webp are accepted.');
  }

  const normalized = type?.toLowerCase();

  if (normalized === 'png') {
    return { ...PNG_METADATA };
  }

  if (normalized === 'jpg' || normalized === 'jpeg') {
    return { ...JPEG_METADATA };
  }

  if (normalized === 'webp') {
    return { ...WEBP_METADATA };
  }

  throw new BadRequestException(`Unsupported image type: ${type ?? 'unknown'}. Only png, jpg, webp are accepted.`);
}

export function sanitizeImageStem(originalName: string): string {
  const base = originalName.split('/').pop()?.split('\\').pop() ?? originalName;
  const dotIndex = base.lastIndexOf('.');
  const withoutExt = dotIndex > 0 ? base.slice(0, dotIndex) : base;
  const replaced = withoutExt.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  const truncated = replaced.slice(0, 64).replace(/^_+|_+$/g, '');
  return truncated || 'image';
}

export function buildMediaObjectName(originalName: string, extension: UploadImageExtension): string {
  const stem = sanitizeImageStem(originalName);
  return `${uuidv7()}/${stem}.${extension}`;
}

export function getObjectNameFromUrl(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`;
  const index = url.lastIndexOf(marker);
  if (index === -1) {
    return null;
  }
  const raw = url.slice(index + marker.length).split('?')[0]?.split('#')[0];
  if (!raw) {
    return null;
  }
  return raw;
}

export function splitObjectName(objectName: string): { id: string; format: string } {
  const dot = objectName.lastIndexOf('.');
  if (dot === -1) {
    return { id: objectName, format: '' };
  }
  return { id: objectName.slice(0, dot), format: objectName.slice(dot + 1) };
}

export function parseMediaUrl(url: string, bucket: string): { id: string; format: string } | null {
  const objectName = getObjectNameFromUrl(url, bucket);
  if (!objectName) {
    return null;
  }
  return splitObjectName(objectName);
}

export function toUploadMinioMetadata(detection: UploadImageDetection): Record<string, string> {
  return {
    'Content-Type': detection.contentType,
    'X-Amz-Meta-Content-Type': detection.contentType,
    'X-Amz-Meta-Mime-Type': detection.mimeType,
    'X-Amz-Meta-Format': detection.format,
  };
}
