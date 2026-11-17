export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** Correlated in-flight RPC/stream awaits, keyed by frame id. */
export class PendingRegistry {
  private readonly pending = new Map<string, PendingRequest>();

  add(id: string, request: PendingRequest): void {
    this.pending.set(id, request);
  }

  get(id: string): PendingRequest | undefined {
    return this.pending.get(id);
  }

  get size(): number {
    return this.pending.size;
  }

  keys(): IterableIterator<string> {
    return this.pending.keys();
  }

  /** Remove the entry and clear its timer, returning it when present. */
  take(id: string): PendingRequest | undefined {
    const request = this.pending.get(id);
    if (!request) return undefined;
    clearTimeout(request.timer);
    this.pending.delete(id);
    return request;
  }

  delete(id: string): void {
    this.pending.delete(id);
  }

  rejectAll(cause: Error): void {
    for (const [id, request] of this.pending) {
      clearTimeout(request.timer);
      request.reject(cause);
      this.pending.delete(id);
    }
  }
}
