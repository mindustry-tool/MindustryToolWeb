import { Logger } from '@nestjs/common';
import {
  WsMessage,
  SubscriptionDescriptor,
  SubscriptionParams,
  SubscriptionEvent,
  PushHandle,
  SubscribeContext,
  wireErrorDetail,
  createListen,
  createListening,
  createEventFrame,
  createUnlisten,
  createListenEnded,
  createListenError,
  listenPayloadSchema,
} from '../protocol';
import { ChannelTransport } from './transport';
import { TIMEOUT_DEFAULT_MS } from './constants';

interface SubscriptionHandlerEntry {
  descriptor: SubscriptionDescriptor;
  run: (params: unknown, pushHandle: PushHandle, context: SubscribeContext) => Promise<void>;
}

interface ClientSubscriptionSlot {
  id: string;
  event: string;
  handler: (event: unknown) => void;
  onCloseCallbacks: Array<() => void>;
  closed: boolean;
  ackPromise: Promise<void>;
  ackResolve: () => void;
  ackReject: (reason: Error) => void;
}

interface ServerSubscriptionSlot {
  listenId: string;
  event: string;
  params: unknown;
  handle: PushHandle;
  onCloseCallbacks: Array<() => void>;
  closed: boolean;
}

/** Handle returned by `subscribe`; tears down via the wire `unlisten` path. */
export interface SubscriptionHandle {
  unsubscribe(reason?: string): void;
}

/** Event-stream sub-protocol: server push handles and client subscriptions. */
export class SubscriptionEndpoint {
  private readonly logger = new Logger(SubscriptionEndpoint.name);
  private readonly subscriptionHandlers = new Map<string, SubscriptionHandlerEntry>();
  private readonly clientSubscriptions = new Map<string, ClientSubscriptionSlot>();
  private readonly serverSubscriptions = new Map<string, ServerSubscriptionSlot>();

  constructor(private readonly transport: ChannelTransport) {}

  registerSubscriptionHandler<D extends SubscriptionDescriptor>(
    descriptor: D,
    onSubscribe: (params: SubscriptionParams<D>, pushHandle: PushHandle, context: SubscribeContext) => Promise<void>,
  ): void {
    this.subscriptionHandlers.set(descriptor.event, {
      descriptor,
      run: (params, pushHandle, context) => onSubscribe(params as SubscriptionParams<D>, pushHandle, context),
    });
  }

  unregisterSubscriptionHandler(descriptor: SubscriptionDescriptor): void {
    this.subscriptionHandlers.delete(descriptor.event);
  }

  hasSubscriptionHandler(descriptor: SubscriptionDescriptor): boolean {
    return this.subscriptionHandlers.has(descriptor.event);
  }

  subscribe<D extends SubscriptionDescriptor>(
    descriptor: D,
    data: SubscriptionParams<D>,
    handler: (event: SubscriptionEvent<D>) => void,
    timeoutMs = TIMEOUT_DEFAULT_MS,
  ): Promise<SubscriptionHandle> {
    const eventType = descriptor.event;
    if (!this.transport.isOpen) {
      return Promise.reject(new Error(`Cannot subscribe to "${eventType}": no open session`));
    }

    const msg = createListen(eventType, data);
    const id = msg.id;

    let ackResolve!: () => void;
    let ackReject!: (reason: Error) => void;
    const ackPromise = new Promise<void>((resolve, reject) => {
      ackResolve = resolve;
      ackReject = reject;
    });

    const slot: ClientSubscriptionSlot = {
      id,
      event: eventType,
      handler: (event) => handler(event as SubscriptionEvent<D>),
      onCloseCallbacks: [],
      closed: false,
      ackPromise,
      ackResolve,
      ackReject,
    };
    this.clientSubscriptions.set(id, slot);

    const timer = setTimeout(() => {
      const s = this.clientSubscriptions.get(id);
      if (s) {
        this.clientSubscriptions.delete(id);
        s.closed = true;
        s.ackReject(new Error(`Subscription timed out after ${timeoutMs}ms: ${eventType}`));
      }
    }, timeoutMs);
    void ackPromise.then(
      () => clearTimeout(timer),
      () => clearTimeout(timer),
    );

    this.transport.sendText(msg);

    return ackPromise.then(() => ({
      unsubscribe: (reason?: string) => this.unsubscribe(id, reason),
    }));
  }

  unsubscribe(requestId: string, reason?: string): void {
    const slot = this.clientSubscriptions.get(requestId);
    if (!slot) return;

    slot.closed = true;
    for (const cb of slot.onCloseCallbacks) {
      try {
        cb();
      } catch (err) {
        this.logger.warn('Subscription onClose callback failed', err);
      }
    }
    this.clientSubscriptions.delete(requestId);

    if (!this.transport.isOpen) return;

    this.transport.sendText(createUnlisten(requestId, slot.event, reason));
  }

  onSubscriptionClose(requestId: string, callback: () => void): void {
    const slot = this.clientSubscriptions.get(requestId);
    if (slot) {
      slot.onCloseCallbacks.push(callback);
    } else {
      try {
        callback();
      } catch (err) {
        this.logger.warn('Subscription onClose callback failed', err);
      }
    }
  }

  handleListen(msg: WsMessage<unknown>): void {
    const listenId = msg.id;
    const event = msg.event as string;
    const rawPayload = (msg.payload ?? {}) as unknown;
    const parsed = listenPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      this.transport.sendText(createListenError(listenId, event, 'Invalid listen payload'));
      return;
    }
    const data = parsed.data.data;

    const entry = this.subscriptionHandlers.get(event);
    if (!entry) {
      this.transport.sendText(createListenError(listenId, event, `unknown event: ${event}`));
      return;
    }

    const paramsParsed = entry.descriptor.params.safeParse(data);
    if (!paramsParsed.success) {
      this.transport.sendText(createListenError(listenId, event, 'Invalid event params'));
      return;
    }

    if (this.serverSubscriptions.has(listenId)) {
      this.transport.sendText(createListenError(listenId, event, 'Duplicate subscription ID'));
      return;
    }

    const pushHandle = this.createPushHandle(listenId, event);
    const context: SubscribeContext = { subscribeId: listenId, eventType: event };

    const slot: ServerSubscriptionSlot = {
      listenId,
      event,
      params: paramsParsed.data,
      handle: pushHandle,
      onCloseCallbacks: [],
      closed: false,
    };
    this.serverSubscriptions.set(listenId, slot);

    pushHandle.onClose(() => {
      this.serverSubscriptions.delete(listenId);
    });

    let handlerResult: unknown;
    try {
      handlerResult = entry.run(paramsParsed.data, pushHandle, context);
    } catch (err) {
      this.serverSubscriptions.delete(listenId);
      this.transport.sendText(
        createListenError(listenId, event, `Subscription handler failed: ${err instanceof Error ? err.message : String(err)}`),
      );
      return;
    }

    void Promise.resolve(handlerResult).then(() => {
      if (!this.serverSubscriptions.has(listenId)) {
        return;
      }
      this.transport.sendText(createListening(listenId, event));
    }).catch((err) => {
      this.serverSubscriptions.delete(listenId);
      this.transport.sendText(createListenError(listenId, event, err instanceof Error ? err.message : String(err)));
    });
  }

  handleUnlisten(msg: WsMessage<unknown>): void {
    const listenId = msg.responseOf ?? undefined;
    if (!listenId) {
      this.logger.debug('Dropping unlisten with missing responseOf');
      return;
    }
    const slot = this.serverSubscriptions.get(listenId);
    if (!slot) {
      this.logger.debug(`Dropping unlisten for unknown listener: ${listenId}`);
      return;
    }
    slot.closed = true;
    this.serverSubscriptions.delete(listenId);
    slot.handle.complete();
    for (const cb of slot.onCloseCallbacks) {
      try {
        cb();
      } catch (err) {
        this.logger.warn('Subscription onClose callback failed', err);
      }
    }
  }

  handleListening(msg: WsMessage<unknown>): void {
    const listenId = msg.responseOf ?? undefined;
    if (!listenId) {
      this.logger.warn('Received listening without responseOf; dropping');
      return;
    }
    const slot = this.clientSubscriptions.get(listenId);
    if (!slot) {
      this.logger.warn(`Received listening for unknown listener: ${listenId}`);
      return;
    }
    if (slot.closed) {
      this.logger.warn(`Received listening for closed listener: ${listenId}`);
      return;
    }
    slot.ackResolve();
  }

  handleEvent(msg: WsMessage<unknown>): void {
    const listenId = msg.responseOf ?? undefined;
    if (!listenId) {
      this.logger.warn('Received event without responseOf; dropping');
      return;
    }
    const slot = this.clientSubscriptions.get(listenId);
    if (!slot) {
      this.logger.warn(`Received event for unknown listener: ${listenId}`);
      return;
    }
    if (slot.closed) {
      this.logger.warn(`Received event for closed listener: ${listenId}`);
      return;
    }
    if (msg.payload === null || msg.payload === undefined) return;
    try {
      slot.handler(msg.payload);
    } catch (err) {
      this.logger.error(`Subscription handler failed for ${slot.event}`, err);
    }
  }

  handleListenEnded(msg: WsMessage<unknown>): void {
    const listenId = msg.responseOf ?? undefined;
    if (!listenId) return;
    const slot = this.clientSubscriptions.get(listenId);
    if (!slot) return;
    slot.closed = true;
    this.clientSubscriptions.delete(listenId);
    slot.ackResolve();
    for (const cb of slot.onCloseCallbacks) {
      try {
        cb();
      } catch (err) {
        this.logger.warn('Subscription onClose callback failed', err);
      }
    }
  }

  handleListenError(msg: WsMessage<unknown>): void {
    const listenId = msg.responseOf ?? undefined;
    if (!listenId) return;
    const slot = this.clientSubscriptions.get(listenId);
    if (!slot) return;
    slot.closed = true;
    slot.ackReject(new Error(wireErrorDetail(msg.payload, 'event stream failed')));
    for (const cb of slot.onCloseCallbacks) {
      try {
        cb();
      } catch (err) {
        this.logger.warn('Subscription onClose callback failed', err);
      }
    }
    this.clientSubscriptions.delete(listenId);
  }

  /** Mark all client listeners closed and end all server listeners on socket loss. */
  dispose(cause: Error): void {
    for (const slot of [...this.clientSubscriptions.values()]) {
      slot.closed = true;
      slot.ackReject(cause);
      for (const cb of slot.onCloseCallbacks) {
        try {
          cb();
        } catch (err) {
          this.logger.warn('Client subscription onClose callback failed', err);
        }
      }
    }
    this.clientSubscriptions.clear();
    for (const slot of [...this.serverSubscriptions.values()]) {
      slot.closed = true;
      slot.handle.complete();
      for (const cb of slot.onCloseCallbacks) {
        try {
          cb();
        } catch (err) {
          this.logger.warn('Server subscription onClose callback failed', err);
        }
      }
    }
    this.serverSubscriptions.clear();
  }

  private createPushHandle(listenId: string, event: string): PushHandle {
    let closed = false;
    const closeCallbacks: Array<() => void> = [];

    const fireCloseCallbacks = () => {
      for (const cb of [...closeCallbacks]) {
        try {
          cb();
        } catch (err) {
          this.logger.warn('PushHandle onClose callback failed', err);
        }
      }
    };

    return {
      push: (payload: unknown) => {
        if (closed) return;
        this.transport.sendText(createEventFrame(listenId, event, payload));
      },
      complete: () => {
        if (closed) return;
        closed = true;
        this.transport.sendText(createListenEnded(listenId, event));
        fireCloseCallbacks();
      },
      fail: (reason: string) => {
        if (closed) return;
        closed = true;
        this.transport.sendText(createListenError(listenId, event, reason));
        fireCloseCallbacks();
      },
      isClosed: () => closed,
      onClose: (callback: () => void) => {
        if (closed) {
          try {
            callback();
          } catch (err) {
            this.logger.warn('PushHandle onClose callback failed', err);
          }
        } else {
          closeCallbacks.push(callback);
        }
      },
    };
  }
}
