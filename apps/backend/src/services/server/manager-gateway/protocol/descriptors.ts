import { z } from 'zod/v4-mini';

export const streamStartPayloadSchema = z.object({
  streamId: z.uuid(),
  metadata: z.optional(z.unknown()),
  totalChunks: z.int().check(z.gte(1)),
  sha256: z.string().check(z.minLength(1)),
});

export const streamDonePayloadSchema = z.object({
  streamId: z.uuid(),
  sha256: z.string().check(z.minLength(1)),
});

export const streamAbortPayloadSchema = z.object({
  streamId: z.uuid(),
  reason: z.string().check(z.minLength(1)),
});

export const listenPayloadSchema = z.object({
  data: z.optional(z.unknown()),
});

export interface PushHandle {
  push(event: unknown): void;
  complete(): void;
  fail(reason: string): void;
  isClosed(): boolean;
  onClose(callback: () => void): void;
}

export interface SubscribeContext {
  subscribeId: string;
  eventType: string;
}

type Schema = z.ZodMiniType;

export interface RpcDescriptor<TReq extends Schema = Schema, TRes extends Schema = Schema> {
  readonly type: string;
  readonly request: TReq;
  readonly response: TRes;
}

export interface StreamDescriptor<TMeta extends Schema = Schema, TRes extends Schema = Schema> {
  readonly streamType: string;
  readonly metadata: TMeta;
  readonly response: TRes;
}

export interface SubscriptionDescriptor<TParams extends Schema = Schema, TEvent extends Schema = Schema> {
  readonly event: string;
  readonly params: TParams;
  readonly eventSchema: TEvent;
}

export function defineRpc<TReq extends Schema, TRes extends Schema>(descriptor: {
  type: string;
  request: TReq;
  response: TRes;
}): RpcDescriptor<TReq, TRes> {
  return descriptor;
}

export function defineStream<TMeta extends Schema, TRes extends Schema>(descriptor: {
  streamType: string;
  metadata: TMeta;
  response: TRes;
}): StreamDescriptor<TMeta, TRes> {
  return descriptor;
}

export function defineSubscription<TParams extends Schema, TEvent extends Schema>(descriptor: {
  event: string;
  params: TParams;
  eventSchema: TEvent;
}): SubscriptionDescriptor<TParams, TEvent> {
  return descriptor;
}

export type RpcRequest<D extends RpcDescriptor> = z.infer<D['request']>;
export type RpcResponse<D extends RpcDescriptor> = z.infer<D['response']>;
export type StreamMetadata<D extends StreamDescriptor> = z.infer<D['metadata']>;
export type StreamResponse<D extends StreamDescriptor> = z.infer<D['response']>;
export type SubscriptionParams<D extends SubscriptionDescriptor> = z.infer<D['params']>;
export type SubscriptionEvent<D extends SubscriptionDescriptor> = z.infer<D['eventSchema']>;
