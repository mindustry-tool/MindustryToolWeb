import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import {
  WsMessage,
  FrameKind,
  FRAME_KINDS,
  TYPE_SUBJECT_KINDS,
  PushHandle,
  SubscribeContext,
  RpcDescriptor,
  RpcRequest,
  RpcResponse,
  StreamDescriptor,
  StreamMetadata,
  StreamResponse,
  SubscriptionDescriptor,
  SubscriptionParams,
  SubscriptionEvent,
} from '../protocol';
import { ChannelTransport } from './transport';
import { PendingRegistry } from './pending-registry';
import { RpcEndpoint, HandlerFn } from './rpc-endpoint';
import { StreamEndpoint, StreamData, StreamOptions, ReplyStreamOptions } from './stream-endpoint';
import { SubscriptionEndpoint, SubscriptionHandle } from './subscription-endpoint';

export { DEFER_REPLY } from './rpc-endpoint';
export type { SubscriptionHandle } from './subscription-endpoint';
export { TIMEOUT_DEFAULT_MS, TIMEOUT_SHORT_MS } from './constants';
export type { PushHandle } from '../protocol';

/** Wraps a single `ws.WebSocket` connection; routes WS-RPC v2 frames on `kind`. */
export class RpcChannel {
  private readonly logger = new Logger(RpcChannel.name);
  private readonly transport: ChannelTransport;
  private readonly pending: PendingRegistry;
  private readonly rpc: RpcEndpoint;
  private readonly stream: StreamEndpoint;
  private readonly subscriptions: SubscriptionEndpoint;

  constructor(ws: WebSocket) {
    this.transport = new ChannelTransport(ws);
    this.pending = new PendingRegistry();
    this.rpc = new RpcEndpoint(this.transport, this.pending);
    this.stream = new StreamEndpoint(this.transport, this.pending);
    this.subscriptions = new SubscriptionEndpoint(this.transport);

    this.transport.onMessage(
      (text) => this.handleText(text),
      (frame) => this.stream.handleBinary(frame),
    );

    this.transport.onClose(() => {
      const cause = new Error('WebSocket connection closed');
      this.pending.rejectAll(cause);
      this.stream.dispose();
      this.subscriptions.dispose(cause);
    });
  }

  registerHandler<D extends RpcDescriptor>(descriptor: D, handler: HandlerFn<RpcRequest<D>>): void {
    this.rpc.registerHandler(descriptor, handler);
  }

  unregisterHandler(descriptor: RpcDescriptor): void {
    this.rpc.unregisterHandler(descriptor);
  }

  sendRequest<D extends RpcDescriptor>(
    descriptor: D,
    payload: RpcRequest<D>,
    timeoutMs?: number,
  ): Promise<RpcResponse<D>> {
    return this.rpc.sendRequest(descriptor, payload, timeoutMs);
  }

  sendNotification<D extends RpcDescriptor>(descriptor: D, payload: RpcRequest<D>): void {
    this.rpc.sendNotification(descriptor, payload);
  }

  registerStreamHandler<D extends StreamDescriptor>(
    descriptor: D,
    handler: (meta: StreamMetadata<D>, bytes: Buffer) => unknown,
  ): void {
    this.stream.registerStreamHandler(descriptor, handler);
  }

  sendStream<D extends StreamDescriptor>(
    descriptor: D,
    metadata: StreamMetadata<D>,
    data: StreamData,
    opts: StreamOptions = {},
  ): Promise<StreamResponse<D>> {
    return this.stream.sendStream(descriptor, metadata, data, opts);
  }

  replyWithStream<D extends StreamDescriptor>(
    requestId: string,
    descriptor: D,
    metadata: StreamMetadata<D>,
    data: StreamData,
    opts: ReplyStreamOptions = {},
  ): Promise<void> {
    return this.stream.replyWithStream(requestId, descriptor, metadata, data, opts);
  }

  abortStream(streamId: string, streamType: string, reason: string): boolean {
    return this.stream.abortStream(streamId, streamType, reason);
  }

  registerSubscriptionHandler<D extends SubscriptionDescriptor>(
    descriptor: D,
    onSubscribe: (params: SubscriptionParams<D>, pushHandle: PushHandle, context: SubscribeContext) => Promise<void>,
  ): void {
    this.subscriptions.registerSubscriptionHandler(descriptor, onSubscribe);
  }

  unregisterSubscriptionHandler(descriptor: SubscriptionDescriptor): void {
    this.subscriptions.unregisterSubscriptionHandler(descriptor);
  }

  hasSubscriptionHandler(descriptor: SubscriptionDescriptor): boolean {
    return this.subscriptions.hasSubscriptionHandler(descriptor);
  }

  subscribe<D extends SubscriptionDescriptor>(
    descriptor: D,
    data: SubscriptionParams<D>,
    handler: (event: SubscriptionEvent<D>) => void,
    timeoutMs?: number,
  ): Promise<SubscriptionHandle> {
    return this.subscriptions.subscribe(descriptor, data, handler, timeoutMs);
  }

  unsubscribe(requestId: string, reason?: string): void {
    this.subscriptions.unsubscribe(requestId, reason);
  }

  onSubscriptionClose(requestId: string, callback: () => void): void {
    this.subscriptions.onSubscriptionClose(requestId, callback);
  }

  private handleText(raw: string): void {
    let msg: WsMessage<unknown>;
    try {
      msg = JSON.parse(raw) as WsMessage<unknown>;
    } catch {
      this.logger.warn('Received unparseable JSON; dropping');
      return;
    }
    if (typeof msg !== 'object' || msg === null) {
      this.logger.warn('Received non-object frame; dropping');
      return;
    }

    const kind: unknown = msg.kind;
    if (typeof kind !== 'string' || !FRAME_KINDS.has(kind)) {
      this.logger.warn(`Dropping frame with absent or unknown kind: ${String(kind)}`);
      return;
    }
    if (typeof msg.id !== 'string' || msg.id.length === 0) {
      this.logger.warn(`Dropping ${kind} frame without id`);
      return;
    }

    // Subject-field validation: `type` for RPC/byte streams, `event` for event streams.
    if (TYPE_SUBJECT_KINDS.has(kind)) {
      if (typeof msg.type !== 'string' || msg.type.length === 0 || msg.event != null) {
        this.logger.warn(`Dropping ${kind} frame with wrong subject field`);
        return;
      }
    } else {
      if (typeof msg.event !== 'string' || msg.event.length === 0 || msg.type != null) {
        this.logger.warn(`Dropping ${kind} frame with wrong subject field`);
        return;
      }
    }

    switch (kind as FrameKind) {
      case 'request':
        this.rpc.handleRequest(msg);
        return;
      case 'notification':
        this.rpc.handleNotification(msg);
        return;
      case 'response':
      case 'response-error':
        this.rpc.handleAnswer(msg);
        return;
      case 'stream-start':
        this.stream.handleStreamStart(msg);
        return;
      case 'stream-reply-start':
        this.stream.handleStreamReplyStart(msg);
        return;
      case 'stream-done':
        this.stream.handleStreamDone(msg);
        return;
      case 'stream-reply-done':
        this.stream.handleStreamReplyDone(msg);
        return;
      case 'stream-abort':
        this.stream.handleStreamAbort(msg);
        return;
      case 'listen':
        this.subscriptions.handleListen(msg);
        return;
      case 'listening':
        this.subscriptions.handleListening(msg);
        return;
      case 'event':
        this.subscriptions.handleEvent(msg);
        return;
      case 'unlisten':
        this.subscriptions.handleUnlisten(msg);
        return;
      case 'listen-ended':
        this.subscriptions.handleListenEnded(msg);
        return;
      case 'listen-error':
        this.subscriptions.handleListenError(msg);
        return;
    }
  }
}
