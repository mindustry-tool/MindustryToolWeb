import { randomUUID } from 'crypto';
import type WebSocket from 'ws';

// WS-RPC v2 envelope (see MindustryServerManager/WS-RPC.md)

/** Every control frame declares its sort with an explicit `kind` field. */
export type FrameKind =
  | 'request'
  | 'response'
  | 'response-error'
  | 'notification'
  | 'stream-start'
  | 'stream-done'
  | 'stream-abort'
  | 'stream-reply-start'
  | 'stream-reply-done'
  | 'listen'
  | 'listening'
  | 'event'
  | 'unlisten'
  | 'listen-ended'
  | 'listen-error';

const ALL_KINDS: readonly FrameKind[] = [
  'request',
  'response',
  'response-error',
  'notification',
  'stream-start',
  'stream-done',
  'stream-abort',
  'stream-reply-start',
  'stream-reply-done',
  'listen',
  'listening',
  'event',
  'unlisten',
  'listen-ended',
  'listen-error',
];

export const FRAME_KINDS: ReadonlySet<string> = new Set<string>(ALL_KINDS);

/** Kinds carrying the application subject in `type` (RPC + byte streams). */
export const TYPE_SUBJECT_KINDS: ReadonlySet<string> = new Set<string>([
  'request',
  'notification',
  'response',
  'response-error',
  'stream-start',
  'stream-done',
  'stream-abort',
  'stream-reply-start',
  'stream-reply-done',
]);

/** Kinds carrying the application subject in `event` (event streams). */
export const EVENT_SUBJECT_KINDS: ReadonlySet<string> = new Set<string>([
  'listen',
  'listening',
  'event',
  'unlisten',
  'listen-ended',
  'listen-error',
]);

/** Close code sent to a live manager socket replaced by a new connection. */
export const MANAGER_REPLACED_CLOSE_CODE = 4234;

export interface WsMessage<T = unknown> {
  id: string;
  kind: FrameKind;
  type?: string | null;
  event?: string | null;
  payload?: T | null;
  responseOf?: string | null;
}

function baseFrame(kind: FrameKind, id: string = randomUUID()): { id: string; kind: FrameKind } {
  return { id, kind };
}

export function createRequest<T>(type: string, payload: T | null): WsMessage<T> {
  return { ...baseFrame('request'), type, payload };
}

export function createNotification<T>(type: string, payload: T | null): WsMessage<T> {
  return { ...baseFrame('notification'), type, payload };
}

export function createResponse<T>(requestId: string, type: string, payload: T | null): WsMessage<T> {
  return { ...baseFrame('response'), type, payload, responseOf: requestId };
}

export function createResponseError(requestId: string, type: string, detail: string): WsMessage<string> {
  return { ...baseFrame('response-error'), type, payload: detail, responseOf: requestId };
}

export function createStreamStart<T>(type: string, payload: T): WsMessage<T> {
  return { ...baseFrame('stream-start'), type, payload };
}

export function createStreamDone(type: string, payload: { streamId: string; sha256: string }): WsMessage<typeof payload> {
  return { ...baseFrame('stream-done'), type, payload };
}

export function createStreamAbort(type: string, payload: { streamId: string; reason: string }): WsMessage<typeof payload> {
  return { ...baseFrame('stream-abort'), type, payload };
}

export function createStreamReplyStart<T>(requestId: string, type: string, payload: T): WsMessage<T> {
  return { ...baseFrame('stream-reply-start'), type, payload, responseOf: requestId };
}

export function createStreamReplyDone(requestId: string, type: string, payload: { streamId: string; sha256: string }): WsMessage<typeof payload> {
  return { ...baseFrame('stream-reply-done'), type, payload, responseOf: requestId };
}

export function createListen(event: string, data: unknown): WsMessage<{ data: unknown }> {
  return { ...baseFrame('listen'), event, payload: { data } };
}

export function createListening(listenId: string, event: string): WsMessage<null> {
  return { ...baseFrame('listening'), event, payload: null, responseOf: listenId };
}

export function createEventFrame<T>(listenId: string, event: string, payload: T | null): WsMessage<T | null> {
  return { ...baseFrame('event'), event, payload, responseOf: listenId };
}

export function createUnlisten(listenId: string, event: string, reason?: string): WsMessage<{ reason?: string } | null> {
  return { ...baseFrame('unlisten'), event, payload: reason ? { reason } : null, responseOf: listenId };
}

export function createListenEnded(listenId: string, event: string): WsMessage<null> {
  return { ...baseFrame('listen-ended'), event, payload: null, responseOf: listenId };
}

export function createListenError(listenId: string, event: string, detail: string): WsMessage<string> {
  return { ...baseFrame('listen-error'), event, payload: detail, responseOf: listenId };
}

/** Unquoted error text for wire payloads (matches Java `asText` behavior). */
export function wireErrorDetail(payload: unknown, fallback: string): string {
  if (payload == null) return fallback;
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload) ?? fallback;
  } catch {
    return fallback;
  }
}

export function rawDataToText(data: WebSocket.RawData): string | null {
  if (typeof data === 'string') return data;
  if (Buffer.isBuffer(data)) return data.toString('utf-8');
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf-8');
  if (Array.isArray(data)) {
    try {
      return Buffer.concat(data).toString('utf-8');
    } catch {
      return null;
    }
  }
  return null;
}
