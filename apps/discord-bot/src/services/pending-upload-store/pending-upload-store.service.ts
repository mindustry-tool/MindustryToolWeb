import { Injectable, Logger } from '@nestjs/common';
import { v7 } from 'uuid';

export interface PendingUpload {
  base64: string;
  fileType: 'msch' | 'msav';
  userId: string;
  discordUserId: string;
  uploaded: boolean;
  createdAt: number;
}

@Injectable()
export class PendingUploadStore {
  private readonly logger = new Logger(PendingUploadStore.name);
  private readonly entries = new Map<string, PendingUpload>();

  private readonly TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_ENTRIES = 1000;

  constructor() {
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Store a pending upload and return the unique upload ID.
   */
  store(data: Omit<PendingUpload, 'uploaded' | 'createdAt'>): string {
    const id = v7();

    this.entries.set(id, {
      ...data,
      uploaded: false,
      createdAt: Date.now(),
    });

    return id;
  }

  /**
   * Get a pending upload by ID, or null if not found / expired.
   */
  get(id: string): PendingUpload | null {
    const entry = this.entries.get(id);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.createdAt > this.TTL) {
      this.entries.delete(id);
      return null;
    }

    return entry;
  }

  /**
   * Remove a pending upload by ID.
   */
  remove(id: string): void {
    this.entries.delete(id);
  }

  /**
   * Mark a pending upload as uploaded.
   */
  markUploaded(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.uploaded = true;
    }
  }

  private cleanup() {
    const now = Date.now();
    let removedCount = 0;

    for (const [id, entry] of this.entries.entries()) {
      if (now - entry.createdAt > this.TTL) {
        this.entries.delete(id);
        removedCount++;
      }
    }

    // If still too many entries, remove oldest ones
    if (this.entries.size > this.MAX_ENTRIES) {
      const entries = Array.from(this.entries.entries()).sort(
        (a, b) => a[1].createdAt - b[1].createdAt,
      );

      const toRemove = entries.slice(0, this.entries.size - this.MAX_ENTRIES);
      for (const [id] of toRemove) {
        this.entries.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(
        `Cleaned up ${removedCount} expired pending uploads. Current size: ${this.entries.size}`,
      );
    }
  }
}
