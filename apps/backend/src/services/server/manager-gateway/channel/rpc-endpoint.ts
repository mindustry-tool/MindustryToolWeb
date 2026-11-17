import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import {
  WsMessage,
  RpcDescriptor,
  RpcRequest,
  RpcResponse,
  createRequest,
  createNotification,
  createResponse,
  createResponseError,
  wireErrorDetail,
} from '../protocol';
import { ChannelTransport } from './transport';
import { PendingRegistry } from './pending-registry';
import { TIMEOUT_DEFAULT_MS } from './constants';

export type HandlerFn<TReq = unknown> = (payload: TReq, ws: WebSocket, ctx?: { id: string }) => unknown;

/** Return from a handler to suppress the auto-response (the stream is the answer). */
export const DEFER_REPLY: unique symbol = Symbol('defer-reply');

interface HandlerEntry {
  descriptor: RpcDescriptor;
  run: HandlerFn<unknown>;
}

/** Bidirectional RPC over a channel: outbound requests and inbound handler dispatch. */
export class RpcEndpoint {
  private readonly logger = new Logger(RpcEndpoint.name);
  private readonly handlers = new Map<string, HandlerEntry>();

  constructor(
    private readonly transport: ChannelTransport,
    private readonly pending: PendingRegistry,
  ) {}

  registerHandler<D extends RpcDescriptor>(descriptor: D, handler: HandlerFn<RpcRequest<D>>): void {
    this.handlers.set(descriptor.type, {
      descriptor,
      run: (payload, ws, ctx) => handler(payload as RpcRequest<D>, ws, ctx),
    });
  }

  unregisterHandler(descriptor: RpcDescriptor): void {
    this.handlers.delete(descriptor.type);
  }

  async sendRequest<D extends RpcDescriptor>(
    descriptor: D,
    payload: RpcRequest<D>,
    timeoutMs = TIMEOUT_DEFAULT_MS,
  ): Promise<RpcResponse<D>> {
    if (!this.transport.isOpen) {
      throw new Error(`Cannot send request "${descriptor.type}": no open session`);
    }

    return new Promise<RpcResponse<D>>((resolve, reject) => {
      const msg = createRequest(descriptor.type, payload);

      const timer = setTimeout(() => {
        this.pending.delete(msg.id);
        reject(new Error(`RPC timeout after ${timeoutMs}ms for type "${descriptor.type}"`));
      }, timeoutMs);

      this.pending.add(msg.id, {
        resolve: (v: unknown) => resolve(v as RpcResponse<D>),
        reject,
        timer,
      });

      this.transport.sendText(msg);
    });
  }

  sendNotification<D extends RpcDescriptor>(descriptor: D, payload: RpcRequest<D>): void {
    if (!this.transport.isOpen) {
      this.logger.warn(`Dropping notification "${descriptor.type}": no open session`);
      return;
    }
    this.transport.sendText(createNotification(descriptor.type, payload));
  }

  handleAnswer(msg: WsMessage<unknown>): void {
    const responseOf = msg.responseOf ?? undefined;
    if (!responseOf) {
      this.logger.warn(`Received ${String(msg.kind)} without responseOf; dropping`);
      return;
    }
    const pending = this.pending.take(responseOf);
    if (!pending) {
      this.logger.debug(`No pending call for ${String(msg.kind)} responseOf ${responseOf}; dropping`);
      return;
    }

    if (msg.kind === 'response-error') {
      pending.reject(new Error(wireErrorDetail(msg.payload, 'remote error')));
    } else {
      pending.resolve(msg.payload);
    }
  }

  handleRequest(msg: WsMessage<unknown>): void {
    const type = msg.type as string;
    const entry = this.handlers.get(type);
    if (!entry) {
      this.transport.sendText(createResponseError(msg.id, type, `unknown RPC type: ${type}`));
      return;
    }

    const run = async () => {
      try {
        const parsed = entry.descriptor.request.safeParse(msg.payload);
        if (!parsed.success) {
          const detail = parsed.error.issues
            .map(
              (i) => `${(i.path as Array<string | number | symbol>).map((p) => String(p)).join('.')}: ${i.message}`,
            )
            .join('; ');
          this.transport.sendText(createResponseError(msg.id, type, `Invalid payload: ${detail}`));
          return;
        }
        const result = await entry.run(parsed.data, this.transport.socket, { id: msg.id });
        if (result !== DEFER_REPLY) {
          this.transport.sendText(createResponse(msg.id, type, result ?? null));
        }
      } catch (err) {
        this.logger.error(`Handler error for type "${type}"`, err);
        const detail = err instanceof Error ? err.message : String(err);
        this.transport.sendText(createResponseError(msg.id, type, detail));
      }
    };

    run().catch((e) => this.logger.error('Unexpected error in handler runner', e));
  }

  handleNotification(msg: WsMessage<unknown>): void {
    const type = msg.type as string;
    const entry = this.handlers.get(type);
    if (!entry) {
      // Notifications are never answered, even for unknown types.
      this.logger.warn(`No handler registered for notification type "${type}"; dropping`);
      return;
    }

    const run = async () => {
      try {
        const parsed = entry.descriptor.request.safeParse(msg.payload);
        if (!parsed.success) {
          this.logger.warn(`Invalid notification payload for type "${type}"; dropping`);
          return;
        }
        await entry.run(parsed.data, this.transport.socket, { id: msg.id });
      } catch (err) {
        this.logger.error(`Notification handler error for type "${type}"`, err);
      }
    };

    run().catch((e) => this.logger.error('Unexpected error in notification runner', e));
  }
}
