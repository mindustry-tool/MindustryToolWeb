import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import {
  WsMessage,
  StreamDescriptor,
  StreamMetadata,
  StreamResponse,
  createStreamStart,
  createStreamDone,
  createStreamAbort,
  createStreamReplyStart,
  createStreamReplyDone,
  createResponse,
  createResponseError,
  streamStartPayloadSchema,
  streamDonePayloadSchema,
  streamAbortPayloadSchema,
  decodeChunk,
  DecodedChunk,
  verifySha256,
  sliceIntoChunks,
  sha256Hex,
  MAX_STREAM_BYTES,
  MAX_CONCURRENT_STREAMS,
  MAX_CHUNK_BYTES,
  SLOT_CEILING_MS,
} from '../protocol';
import { ChannelTransport } from './transport';
import { PendingRegistry } from './pending-registry';
import { TIMEOUT_DEFAULT_MS, SLOT_TIMEOUT_MS } from './constants';

interface StreamSlot {
  startId: string;
  streamType: string;
  metadata: unknown;
  totalChunks: number;
  expectedSha256: string;
  chunks: Map<number, Buffer>;
  receivedBytes: number;
  doneReceived: boolean;
  maxBytes: number;
  timeoutMs: number;
  deadlineMs: number;
  timer: ReturnType<typeof setTimeout>;
  linkedRequestId?: string;
  settled: boolean;
}

interface StreamHandlerEntry {
  descriptor: StreamDescriptor;
  run: (meta: unknown, bytes: Buffer) => unknown;
}

export type StreamData = Buffer | Uint8Array | Readable;

export interface StreamOptions {
  timeoutMs?: number;
  maxBytes?: number;
}

export interface ReplyStreamOptions {
  maxBytes?: number;
}

/** Byte-stream sub-protocol: outbound sends, inbound assembly, and reply-with-stream. */
export class StreamEndpoint {
  private readonly logger = new Logger(StreamEndpoint.name);
  private readonly streamSlots = new Map<string, StreamSlot>();
  private readonly streamHandlers = new Map<string, StreamHandlerEntry>();
  private readonly outgoing = new Map<string, { startId: string; streamType: string }>();

  constructor(
    private readonly transport: ChannelTransport,
    private readonly pending: PendingRegistry,
  ) {}

  registerStreamHandler<D extends StreamDescriptor>(
    descriptor: D,
    handler: (meta: StreamMetadata<D>, bytes: Buffer) => unknown,
  ): void {
    this.streamHandlers.set(descriptor.streamType, {
      descriptor,
      run: (meta, bytes) => handler(meta as StreamMetadata<D>, bytes),
    });
  }

  async sendStream<D extends StreamDescriptor>(
    descriptor: D,
    metadata: StreamMetadata<D>,
    data: StreamData,
    opts: StreamOptions = {},
  ): Promise<StreamResponse<D>> {
    const streamType = descriptor.streamType;
    if (!this.transport.isOpen) {
      throw new Error(`Cannot send stream "${streamType}": no open session`);
    }

    const timeoutMs = opts.timeoutMs ?? TIMEOUT_DEFAULT_MS;
    const maxBytes = opts.maxBytes ?? MAX_STREAM_BYTES;

    const buffer = await this.collectStreamData(data, maxBytes);
    if (buffer.length > maxBytes) {
      throw new Error(`Stream exceeds max bytes (${buffer.length} > ${maxBytes})`);
    }
    if (this.openStreamCount() >= MAX_CONCURRENT_STREAMS) {
      throw new Error('Too many concurrent streams');
    }

    const streamId = randomUUID();
    const sha256 = sha256Hex(buffer);
    const frames = sliceIntoChunks(streamId, buffer);
    const totalChunks = frames.length;

    const startMsg = createStreamStart(streamType, { streamId, metadata, totalChunks, sha256 });
    let earlyError: Error | null = null;
    const ack = new Promise<StreamResponse<D>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(startMsg.id);
        this.outgoing.delete(streamId);
        const err = new Error(`Stream timeout after ${timeoutMs}ms: ${streamId}`);
        if (this.transport.isOpen) {
          this.transport.sendText(createStreamAbort(streamType, { streamId, reason: err.message }));
        }
        reject(err);
      }, timeoutMs);
      this.pending.add(startMsg.id, {
        resolve: (v: unknown) => {
          this.outgoing.delete(streamId);
          resolve(v as StreamResponse<D>);
        },
        reject: (e: Error) => {
          this.outgoing.delete(streamId);
          reject(e);
        },
        timer,
      });
    });
    void ack.then(undefined, (e: unknown) => {
      earlyError = e instanceof Error ? e : new Error(String(e));
    });
    this.outgoing.set(streamId, { startId: startMsg.id, streamType });
    this.transport.sendText(startMsg);

    const throwIfFailed = (): void => {
      if (earlyError !== null) {
        throw earlyError;
      }
    };
    try {
      for (const frame of frames) {
        throwIfFailed();
        await this.transport.sendBinary(frame);
      }
      throwIfFailed();
    } catch (err) {
      const p = this.pending.take(startMsg.id);
      if (p) {
        this.outgoing.delete(streamId);
        p.reject(err instanceof Error ? err : new Error(String(err)));
      }
      throw err;
    }

    this.transport.sendText(createStreamDone(streamType, { streamId, sha256 }));

    return ack;
  }

  /** Answer a request with a stream; no answer frame follows. */
  async replyWithStream<D extends StreamDescriptor>(
    requestId: string,
    descriptor: D,
    metadata: StreamMetadata<D>,
    data: StreamData,
    opts: ReplyStreamOptions = {},
  ): Promise<void> {
    const streamType = descriptor.streamType;
    const maxBytes = opts.maxBytes ?? MAX_STREAM_BYTES;
    const buffer = await this.collectStreamData(data, maxBytes);
    if (buffer.length > maxBytes) {
      throw new Error(`Stream exceeds max bytes (${buffer.length} > ${maxBytes})`);
    }
    if (this.openStreamCount() >= MAX_CONCURRENT_STREAMS) {
      throw new Error('Too many concurrent streams');
    }
    if (!this.transport.isOpen) {
      throw new Error('WebSocket is not open');
    }

    const streamId = randomUUID();
    const sha256 = sha256Hex(buffer);
    const frames = sliceIntoChunks(streamId, buffer);
    this.transport.sendText(
      createStreamReplyStart(requestId, streamType, { streamId, metadata, totalChunks: frames.length, sha256 }),
    );
    for (const frame of frames) {
      await this.transport.sendBinary(frame);
    }
    this.transport.sendText(createStreamReplyDone(requestId, streamType, { streamId, sha256 }));
  }

  /**
   * Abort a live outbound stream. Settles locally, emits the abort, never
   * receives a reply. Reply streams are not abortable. Returns true when
   * local state was discarded.
   */
  abortStream(streamId: string, streamType: string, reason: string): boolean {
    const slot = this.streamSlots.get(streamId);
    if (slot && slot.linkedRequestId) {
      return false;
    }
    const out = this.outgoing.get(streamId);
    if (out) {
      const p = this.pending.take(out.startId);
      if (p) {
        p.reject(new Error(reason));
      }
      this.outgoing.delete(streamId);
    }
    const removed = this.discardSlot(streamId, reason, false) || out !== undefined;
    if (!removed) return false;
    if (!this.transport.isOpen) return true;
    this.transport.sendText(createStreamAbort(streamType, { streamId, reason }));
    return true;
  }

  handleStreamStart(msg: WsMessage<unknown>): void {
    const streamType = msg.type as string;
    const parsed = streamStartPayloadSchema.safeParse(msg.payload);
    if (!parsed.success) {
      this.transport.sendText(createResponseError(msg.id, streamType, 'Invalid stream-start payload'));
      return;
    }
    const p = parsed.data;

    const entry = this.streamHandlers.get(streamType);
    if (!entry) {
      this.transport.sendText(createResponseError(msg.id, streamType, `unknown stream type: ${streamType}`));
      return;
    }
    if (this.streamSlots.has(p.streamId)) {
      this.transport.sendText(createResponseError(msg.id, streamType, `Duplicate stream start: ${p.streamId}`));
      return;
    }
    if (this.openStreamCount() >= MAX_CONCURRENT_STREAMS) {
      this.transport.sendText(createResponseError(msg.id, streamType, 'Too many concurrent streams'));
      return;
    }
    const metaParsed = entry.descriptor.metadata.safeParse(p.metadata);
    if (!metaParsed.success) {
      this.transport.sendText(createResponseError(msg.id, streamType, 'Invalid stream metadata'));
      return;
    }

    const timeoutMs = SLOT_TIMEOUT_MS;
    const slot: StreamSlot = {
      startId: msg.id,
      streamType,
      metadata: p.metadata,
      totalChunks: p.totalChunks,
      expectedSha256: p.sha256 ?? '',
      chunks: new Map(),
      receivedBytes: 0,
      doneReceived: false,
      maxBytes: MAX_STREAM_BYTES,
      timeoutMs,
      deadlineMs: Date.now() + SLOT_CEILING_MS,
      timer: setTimeout(() => undefined, 0),
      settled: false,
    };
    this.streamSlots.set(p.streamId, slot);
    this.armStreamTimer(p.streamId, slot);
  }

  handleStreamReplyStart(msg: WsMessage<unknown>): void {
    const requestId = msg.responseOf ?? undefined;
    if (!requestId) {
      this.logger.warn('Received stream-reply-start without responseOf; dropping');
      return;
    }
    const pending = this.pending.get(requestId);
    if (!pending) {
      this.logger.warn(`Received stream-reply-start for unknown request ${requestId}; dropping`);
      return;
    }
    const streamType = msg.type as string;
    const parsed = streamStartPayloadSchema.safeParse(msg.payload);
    if (!parsed.success) {
      this.pending.take(requestId)?.reject(new Error(`Malformed reply stream start for request ${requestId}`));
      return;
    }
    const p = parsed.data;
    if (this.streamSlots.has(p.streamId)) {
      this.pending.take(requestId)?.reject(new Error(`Duplicate stream start: ${p.streamId}`));
      return;
    }
    if (this.openStreamCount() >= MAX_CONCURRENT_STREAMS) {
      this.pending.take(requestId)?.reject(new Error('Too many concurrent streams'));
      return;
    }
    const timeoutMs = SLOT_TIMEOUT_MS;
    const slot: StreamSlot = {
      startId: '',
      streamType,
      metadata: p.metadata,
      totalChunks: p.totalChunks,
      expectedSha256: p.sha256 ?? '',
      chunks: new Map(),
      receivedBytes: 0,
      doneReceived: false,
      maxBytes: MAX_STREAM_BYTES,
      timeoutMs,
      deadlineMs: Date.now() + SLOT_CEILING_MS,
      timer: setTimeout(() => undefined, 0),
      linkedRequestId: requestId,
      settled: false,
    };
    this.streamSlots.set(p.streamId, slot);
    this.armStreamTimer(p.streamId, slot);
  }

  handleStreamDone(msg: WsMessage<unknown>): void {
    if (msg.responseOf != null) {
      this.logger.warn('Received stream-done with responseOf; dropping');
      return;
    }
    const parsed = streamDonePayloadSchema.safeParse(msg.payload);
    if (!parsed.success) {
      this.logger.warn('Received malformed stream-done; dropping');
      return;
    }
    const p = parsed.data;
    const slot = this.streamSlots.get(p.streamId);
    if (!slot) {
      this.logger.warn(`Received done for unknown stream ${p.streamId}; dropping`);
      return;
    }
    if (slot.linkedRequestId) {
      this.settleSlotError(p.streamId, `Stream done linkage mismatch for ${p.streamId}`);
      return;
    }
    this.applyDone(p.streamId, slot, p.sha256);
  }

  handleStreamReplyDone(msg: WsMessage<unknown>): void {
    const requestId = msg.responseOf ?? undefined;
    if (!requestId) {
      this.logger.warn('Received stream-reply-done without responseOf; dropping');
      return;
    }
    const parsed = streamDonePayloadSchema.safeParse(msg.payload);
    if (!parsed.success) {
      this.logger.warn(`Received malformed stream-reply-done for request ${requestId}; dropping`);
      return;
    }
    const p = parsed.data;
    const slot = this.streamSlots.get(p.streamId);
    if (!slot) {
      this.logger.warn(`Received stream-reply-done for unknown stream ${p.streamId}; dropping`);
      return;
    }
    if (slot.linkedRequestId !== requestId) {
      this.settleSlotError(p.streamId, `Stream done linkage mismatch for ${p.streamId}`);
      return;
    }
    this.applyDone(p.streamId, slot, p.sha256);
  }

  handleStreamAbort(msg: WsMessage<unknown>): void {
    const parsed = streamAbortPayloadSchema.safeParse(msg.payload);
    if (!parsed.success) {
      this.logger.warn('Received malformed stream-abort; dropping');
      return;
    }
    const p = parsed.data;
    this.discardSlot(p.streamId, p.reason || `Stream aborted: ${p.streamId}`, true);
  }

  handleBinary(frame: Buffer): void {
    const decoded: DecodedChunk | null = decodeChunk(frame);
    if (!decoded) {
      this.logger.warn(`Binary frame too short (${frame.length} bytes); dropping`);
      return;
    }

    const { transferId: streamId, chunkIndex, payload } = decoded;
    const slot = this.streamSlots.get(streamId);
    if (!slot) {
      this.logger.warn(`Received chunk for unknown stream ${streamId}; dropping`);
      return;
    }

    if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
      this.settleSlotError(streamId, `Invalid chunk index ${chunkIndex}`);
      return;
    }
    if (chunkIndex >= slot.totalChunks) {
      this.settleSlotError(streamId, `Chunk index ${chunkIndex} out of range`);
      return;
    }

    if (payload.length > MAX_CHUNK_BYTES) {
      this.settleSlotError(streamId, `Chunk payload exceeds 64KB (${payload.length}): ${streamId}`);
      return;
    }

    if (slot.chunks.has(chunkIndex)) {
      this.logger.debug(`Ignoring duplicate chunk ${chunkIndex} for stream: ${streamId}`);
      return;
    }
    slot.chunks.set(chunkIndex, Buffer.from(payload));
    slot.receivedBytes += payload.length;

    if (slot.receivedBytes > slot.maxBytes) {
      this.settleSlotError(streamId, `Stream exceeds max bytes (${slot.receivedBytes} > ${slot.maxBytes})`);
      return;
    }

    this.armStreamTimer(streamId, slot);
    void this.tryAssembleStream(streamId);
  }

  /** Drop all receiver slots and sender state on socket close. */
  dispose(): void {
    for (const [streamId, slot] of this.streamSlots) {
      clearTimeout(slot.timer);
      this.streamSlots.delete(streamId);
    }
    this.outgoing.clear();
  }

  private applyDone(streamId: string, slot: StreamSlot, doneSha: string): void {
    if (doneSha && doneSha.toLowerCase() !== slot.expectedSha256.toLowerCase()) {
      this.settleSlotError(streamId, `Stream checksum header mismatch for ${streamId}`);
      return;
    }
    slot.doneReceived = true;
    this.armStreamTimer(streamId, slot);
    void this.tryAssembleStream(streamId);
  }

  private openStreamCount(): number {
    return this.outgoing.size + this.streamSlots.size;
  }

  private armStreamTimer(streamId: string, slot: StreamSlot): void {
    clearTimeout(slot.timer);
    const delay = Math.min(slot.timeoutMs, Math.max(0, slot.deadlineMs - Date.now()));
    slot.timer = setTimeout(() => {
      this.settleSlotError(streamId, `Stream timed out after ${slot.timeoutMs}ms: ${streamId}`);
    }, delay);
  }

  private async collectStreamData(data: StreamData, maxBytes: number): Promise<Buffer> {
    if (Buffer.isBuffer(data)) {
      if (data.length > maxBytes) {
        throw new Error(`Stream exceeds max bytes (${data.length} > ${maxBytes})`);
      }
      return data;
    }
    if (data instanceof Uint8Array) {
      const buf = Buffer.from(data);
      if (buf.length > maxBytes) {
        throw new Error(`Stream exceeds max bytes (${buf.length} > ${maxBytes})`);
      }
      return buf;
    }
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of data) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
      total += buf.length;
      if (total > maxBytes) {
        throw new Error(`Stream exceeds max bytes (${total} > ${maxBytes})`);
      }
      chunks.push(buf);
    }
    return Buffer.concat(chunks, total);
  }

  private discardSlot(streamId: string, detail: string, warnUnknown: boolean): boolean {
    const slot = this.streamSlots.get(streamId);
    if (!slot || slot.settled) {
      if (warnUnknown) {
        this.logger.warn(`Received abort for unknown stream ${streamId}; dropping`);
      }
      return false;
    }
    slot.settled = true;
    clearTimeout(slot.timer);
    this.streamSlots.delete(streamId);
    if (slot.linkedRequestId) {
      const pending = this.pending.take(slot.linkedRequestId);
      if (pending) {
        pending.reject(new Error(detail));
      }
    }
    return true;
  }

  private takeSlot(streamId: string): StreamSlot | null {
    const slot = this.streamSlots.get(streamId);
    if (!slot || slot.settled) return null;
    slot.settled = true;
    clearTimeout(slot.timer);
    this.streamSlots.delete(streamId);
    return slot;
  }

  private settleSlotOk(streamId: string, value: unknown): void {
    const slot = this.takeSlot(streamId);
    if (!slot) return;
    if (slot.linkedRequestId) {
      const pending = this.pending.take(slot.linkedRequestId);
      if (pending) {
        pending.resolve(value);
      }
      return;
    }
    if (!this.transport.isOpen) return;
    this.transport.sendText(createResponse(slot.startId, slot.streamType, value ?? null));
  }

  private settleSlotError(streamId: string, detail: string): void {
    const slot = this.takeSlot(streamId);
    if (!slot) return;
    if (slot.linkedRequestId) {
      const pending = this.pending.take(slot.linkedRequestId);
      if (pending) {
        pending.reject(new Error(detail));
      }
      return;
    }
    if (!this.transport.isOpen) return;
    this.transport.sendText(createResponseError(slot.startId, slot.streamType, detail));
  }

  private async tryAssembleStream(streamId: string): Promise<void> {
    const slot = this.streamSlots.get(streamId);
    if (!slot || slot.settled) return;
    if (!slot.doneReceived) return;
    if (slot.chunks.size < slot.totalChunks) return;

    const ordered: Buffer[] = [];
    for (let i = 0; i < slot.totalChunks; i++) {
      const chunk = slot.chunks.get(i);
      if (!chunk) {
        this.settleSlotError(streamId, `Incomplete stream ${streamId}: missing chunk ${i}`);
        return;
      }
      ordered.push(chunk);
    }

    const assembled = Buffer.concat(ordered);

    if (assembled.length > slot.maxBytes) {
      this.settleSlotError(streamId, `Stream exceeds max bytes (${assembled.length} > ${slot.maxBytes})`);
      return;
    }

    if (!verifySha256(assembled, slot.expectedSha256)) {
      this.settleSlotError(streamId, `Checksum mismatch for stream ${streamId}`);
      return;
    }

    if (slot.linkedRequestId) {
      this.settleSlotOk(streamId, assembled);
      return;
    }

    const entry = this.streamHandlers.get(slot.streamType);
    if (!entry) {
      this.settleSlotError(streamId, `Unknown stream type: ${slot.streamType}`);
      return;
    }

    try {
      const result = await entry.run(slot.metadata, assembled);
      this.settleSlotOk(streamId, result ?? null);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.settleSlotError(streamId, detail);
    }
  }
}
