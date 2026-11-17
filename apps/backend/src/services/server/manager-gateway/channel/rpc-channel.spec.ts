import { randomUUID } from 'crypto';
import { AddressInfo } from 'net';
import { Readable } from 'stream';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { z } from 'zod/v4-mini';
import { DEFER_REPLY, RpcChannel, PushHandle } from './rpc-channel';
import { ManagerGateway } from '../manager-gateway';
import { ConnectionRegistry } from '../connection-registry';
import { ManagerAuthenticator } from '../manager-authenticator';
import { encodeChunk, sha256Hex, sliceIntoChunks, defineRpc, defineStream, defineSubscription } from '../protocol';

// Valid UUIDv7 for download-file request payloads (serverId must be v7).
const SERVER_ID = '0196a1c2-3d4e-7f5a-8b1c-2d3e4f5a6b7c';

interface Pair {
  wss: WebSocketServer;
  serverWs: WebSocket;
  clientWs: WebSocket;
  serverChannel: RpcChannel;
  clientChannel: RpcChannel;
}

async function createPair(): Promise<Pair> {
  const wss = new WebSocketServer({ port: 0 });
  await new Promise<void>((resolve) => wss.on('listening', () => resolve()));
  const port = (wss.address() as AddressInfo).port;

  const serverSide = new Promise<WebSocket>((resolve) => {
    wss.on('connection', (ws: WebSocket) => resolve(ws));
  });
  const clientWs = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise<void>((resolve, reject) => {
    clientWs.on('open', () => resolve());
    clientWs.on('error', (e) => reject(e));
  });
  const serverWs = await serverSide;

  const serverChannel = new RpcChannel(serverWs);
  const clientChannel = new RpcChannel(clientWs);
  return { wss, serverWs, clientWs, serverChannel, clientChannel };
}

async function closePair(p: Pair) {
  p.clientWs.terminate();
  p.serverWs.terminate();
  await new Promise<void>((resolve) => p.wss.close(() => resolve()));
}

function sendJson(ws: WebSocket, obj: unknown) {
  ws.send(JSON.stringify(obj));
}

function textOf(raw: RawData): string | null {
  if (typeof raw === 'string') return raw;
  if (Buffer.isBuffer(raw)) return raw.toString('utf-8');
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf-8');
  if (Array.isArray(raw)) return Buffer.concat(raw).toString('utf-8');
  return null;
}

function collect(ws: WebSocket) {
  const texts: string[] = [];
  const onMsg = (raw: RawData, isBinary: boolean) => {
    if (isBinary) return;
    const text = textOf(raw);
    if (text !== null) texts.push(text);
  };
  ws.on('message', onMsg);
  return { texts, dispose: () => ws.off('message', onMsg) };
}

interface WireFrame {
  id?: string;
  kind?: string;
  type?: string;
  event?: string;
  responseOf?: string;
  payload?: unknown;
}

function parseAll(texts: string[]): WireFrame[] {
  const out: WireFrame[] = [];
  for (const text of texts) {
    try {
      out.push(JSON.parse(text) as WireFrame);
    } catch {
      continue;
    }
  }
  return out;
}

function findAnswer(texts: string[], responseOf: string): WireFrame | null {
  for (const text of texts) {
    try {
      const msg = JSON.parse(text) as WireFrame;
      if (msg.responseOf === responseOf) return msg;
    } catch {
      continue;
    }
  }
  return null;
}

async function waitFor(cond: () => boolean, timeoutMs = 3000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!cond()) {
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((r) => setTimeout(r, 20));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Ad-hoc descriptors for protocol-genericity tests. */
const rpcOf = (type: string) => defineRpc({ type, request: z.unknown(), response: z.unknown() });
const streamOf = (streamType: string) => defineStream({ streamType, metadata: z.unknown(), response: z.unknown() });
const subOf = (event: string, schema: z.ZodMiniType = z.unknown()) =>
  defineSubscription({ event, params: schema, eventSchema: z.unknown() });

describe('RpcChannel streams (loopback)', () => {
  jest.setTimeout(20_000);

  test('assembled ack + handler echo', async () => {
    const p = await createPair();
    try {
      let receivedText = '';
      p.serverChannel.registerStreamHandler(streamOf('echo'), (meta: { name: string }, bytes: Buffer) => {
        receivedText = Buffer.from(bytes).toString('utf-8');
        expect(meta).toEqual({ name: 'x' });
        return { len: bytes.length };
      });
      const data = Buffer.from('hello-stream-world');
      const ack = await p.clientChannel.sendStream(streamOf('echo'), { name: 'x' }, data);
      expect(ack).toEqual({ len: data.length });
      expect(receivedText).toBe('hello-stream-world');
    } finally {
      await closePair(p);
    }
  });

  test('ack carries kind response, type echo, responseOf=startId, no error flag', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('typed'), () => ({ ok: true }));
      const ack = await p.clientChannel.sendStream(streamOf('typed'), {}, Buffer.from('abc'));
      expect(ack).toEqual({ ok: true });
      const answers = parseAll(inbox.texts).filter((m) => m.responseOf !== undefined);
      expect(answers).toHaveLength(1);
      expect(answers[0]).toMatchObject({ kind: 'response', type: 'typed' });
      expect('error' in (answers[0] as Record<string, unknown>)).toBe(false);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('empty file keeps one chunk', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('empty'), () => ({ len: 0 }));
      const ack = await p.clientChannel.sendStream(streamOf('empty'), {}, Buffer.alloc(0));
      expect(ack).toEqual({ len: 0 });
    } finally {
      await closePair(p);
    }
  });

  test('Readable + Uint8Array inputs', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('blob'), (_meta: unknown, bytes: Buffer) => ({ len: bytes.length }));
      const fromReadable = await p.clientChannel.sendStream(streamOf('blob'),
        {},
        Readable.from([Buffer.from('ab'), Buffer.from('cd')]),
      );
      expect(fromReadable).toEqual({ len: 4 });
      const fromU8 = await p.clientChannel.sendStream(streamOf('blob'), {}, new Uint8Array([1, 2, 3]));
      expect(fromU8).toEqual({ len: 3 });
    } finally {
      await closePair(p);
    }
  });

  test('multiplexed interleave', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('m'), (meta: { tag: string }, bytes: Buffer) => ({
        tag: meta.tag,
        len: bytes.length,
        sha: sha256Hex(bytes),
      }));
      const a = Buffer.alloc(200_000, 0x61);
      const b = Buffer.alloc(200_000, 0x62);
      const [ra, rb] = await Promise.all([
        p.clientChannel.sendStream(streamOf('m'), { tag: 'a' }, a),
        p.clientChannel.sendStream(streamOf('m'), { tag: 'b' }, b),
      ]);
      expect(ra).toMatchObject({ tag: 'a', len: a.length, sha: sha256Hex(a) });
      expect(rb).toMatchObject({ tag: 'b', len: b.length, sha: sha256Hex(b) });
    } finally {
      await closePair(p);
    }
  });

  test('unknown stream type rejects fast without blasting chunks', async () => {
    const p = await createPair();
    try {
      await expect(p.clientChannel.sendStream(streamOf('ghost'), {}, Buffer.from('x'))).rejects.toThrow(
        /unknown stream type/i,
      );
    } finally {
      await closePair(p);
    }
  });

  test('sender cap rejects loud (maxBytes override)', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('capped'), () => ({ ok: true }));
      await expect(
        p.clientChannel.sendStream(streamOf('capped'), {}, Buffer.alloc(2048, 1), { maxBytes: 1024 }),
      ).rejects.toThrow(/max bytes/i);
    } finally {
      await closePair(p);
    }
  });

  test('SHA mismatch rejects via corrupted chunk', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('integrity'), () => ({ ok: true }));
      const origSend = p.clientWs.send.bind(p.clientWs);
      let corrupted = false;
      p.clientWs.send = function (data, options?, cb?) {
        if (!corrupted && Buffer.isBuffer(data) && data.length > 20) {
          corrupted = true;
          const copy = Buffer.from(data);
          copy[20] ^= 0xff;
          return origSend(copy, options, cb);
        }
        return origSend(data, options, cb);
      };
      const data = Buffer.alloc(4_096, 0x42);
      await expect(p.clientChannel.sendStream(streamOf('integrity'), {}, data)).rejects.toThrow(/checksum mismatch/i);
    } finally {
      await closePair(p);
    }
  });

  test('done-sha mismatch fails with header detail', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('raw'), () => ({ ok: true }));
      const streamId = randomUUID();
      const startId = randomUUID();
      const data = Buffer.from('header-check');
      const goodSha = sha256Hex(data);
      const badSha = '0'.repeat(64);
      sendJson(p.clientWs, {
        id: startId,
        kind: 'stream-start',
        type: 'raw',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: goodSha },
      });
      await sleep(100);
      p.clientWs.send(encodeChunk(streamId, 0, data), { binary: true });
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-done',
        type: 'raw',
        payload: { streamId, sha256: badSha },
      });
      await waitFor(() => findAnswer(inbox.texts, startId) !== null);
      expect(findAnswer(inbox.texts, startId)).toMatchObject({
        kind: 'response-error',
        type: 'raw',
      });
      expect(String(findAnswer(inbox.texts, startId)?.payload)).toMatch(/checksum header mismatch/i);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('done for unknown stream is dropped with no reply', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      const streamId = randomUUID();
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-done',
        type: 'raw',
        payload: { streamId, sha256: '0'.repeat(64) },
      });
      await sleep(250);
      expect(inbox.texts).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('duplicate start errors and keeps the old slot', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('raw'), () => ({ ok: true }));
      const streamId = randomUUID();
      const startId = randomUUID();
      const dupId = randomUUID();
      const data = Buffer.from('keep-me');
      const sha = sha256Hex(data);
      sendJson(p.clientWs, {
        id: startId,
        kind: 'stream-start',
        type: 'raw',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha },
      });
      await sleep(100);
      sendJson(p.clientWs, {
        id: dupId,
        kind: 'stream-start',
        type: 'raw',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha },
      });
      await waitFor(() => findAnswer(inbox.texts, dupId) !== null);
      expect(findAnswer(inbox.texts, dupId)).toMatchObject({ kind: 'response-error' });
      p.clientWs.send(encodeChunk(streamId, 0, data), { binary: true });
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-done',
        type: 'raw',
        payload: { streamId, sha256: sha },
      });
      await waitFor(() => findAnswer(inbox.texts, startId) !== null);
      expect(findAnswer(inbox.texts, startId)).toMatchObject({ kind: 'response', type: 'raw' });
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('abort discards the slot with no reply', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('raw'), () => ({ ok: true }));
      const streamId = randomUUID();
      const startId = randomUUID();
      const data = Buffer.from('aborted');
      sendJson(p.clientWs, {
        id: startId,
        kind: 'stream-start',
        type: 'raw',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha256Hex(data) },
      });
      await sleep(100);
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-abort',
        type: 'raw',
        payload: { streamId, reason: 'stop-test' },
      });
      await sleep(250);
      expect(findAnswer(inbox.texts, startId)).toBeNull();
      p.clientWs.send(encodeChunk(streamId, 0, data), { binary: true });
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-done',
        type: 'raw',
        payload: { streamId, sha256: sha256Hex(data) },
      });
      await sleep(250);
      expect(findAnswer(inbox.texts, startId)).toBeNull();
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });
  test('unknown request type gets response-error; unknown notification is never answered', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      const id = randomUUID();
      sendJson(p.clientWs, { id, kind: 'request', type: 'nope-x', payload: {} });
      await waitFor(() => findAnswer(inbox.texts, id) !== null);
      const answer = findAnswer(inbox.texts, id);
      expect(answer).toMatchObject({ kind: 'response-error', type: 'nope-x' });
      expect(String(answer?.payload)).toMatch(/unknown RPC type/i);

      const before = inbox.texts.length;
      sendJson(p.clientWs, { id: randomUUID(), kind: 'notification', type: 'nope-y', payload: {} });
      await sleep(250);
      expect(inbox.texts.length).toBe(before);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('notification dispatches to handler with no reply frame', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      const seen: unknown[] = [];
      p.serverChannel.registerHandler(rpcOf('send-chat'), (payload) => {
        seen.push(payload);
      });
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'notification',
        type: 'send-chat',
        payload: { serverId: SERVER_ID, message: 'hi' },
      });
      await waitFor(() => seen.length === 1);
      await sleep(150);
      expect(inbox.texts).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('formerly reserved names register and route (no reserved words in v2)', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerHandler(rpcOf('subscribe'), () => ({ ok: true }));
      p.serverChannel.registerStreamHandler(streamOf('stream-start'), (_meta: unknown, bytes: Buffer) => ({ len: bytes.length }));
      p.serverChannel.registerSubscriptionHandler(subOf('unsubscribe', z.object({})), async () => {});

      const res = await p.clientChannel.sendRequest(rpcOf('subscribe'), { serverId: SERVER_ID });
      expect(res).toEqual({ ok: true });

      const ack = await p.clientChannel.sendStream(streamOf('stream-start'), {}, Buffer.from('abc'));
      expect(ack).toEqual({ len: 3 });
    } finally {
      await closePair(p);
    }
  });

  test('sender timeout emits typed stream-abort', async () => {
    const p = await createPair();
    const serverInbox = collect(p.serverWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('slow'), async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { done: true };
      });
      await expect(
        p.clientChannel.sendStream(streamOf('slow'), {}, Buffer.from('x'), { timeoutMs: 200 }),
      ).rejects.toThrow(/timeout/i);
      await waitFor(() =>
        parseAll(serverInbox.texts).some((m) => m.kind === 'stream-abort' && m.type === 'slow'),
      );
      const abort = parseAll(serverInbox.texts).find((m) => m.kind === 'stream-abort');
      expect(abort).toMatchObject({ kind: 'stream-abort', type: 'slow' });
      const abortPayload = abort?.payload as { streamId?: unknown; reason?: unknown } | undefined;
      expect(abortPayload?.reason).toEqual(expect.stringContaining('timeout'));
      // Give the late ack a chance to arrive (should be dropped, not crash).
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      serverInbox.dispose();
      await closePair(p);
    }
  });

  test('N=8 bound rejects the 9th concurrent stream', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('bulk'), async () => {
        await new Promise((r) => setTimeout(r, 300));
        return { ok: true };
      });
      const sends = Array.from({ length: 9 }, (_, i) =>
        p.clientChannel.sendStream(streamOf('bulk'), { i }, Buffer.from(`payload-${i}`)),
      );
      const results = await Promise.allSettled(sends);
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      expect(rejected.length).toBeGreaterThanOrEqual(1);
      expect(String(rejected[0].reason)).toMatch(/Too many concurrent streams/);
      // Drain remaining so handles close cleanly.
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      await closePair(p);
    }
  });

  test('close rejects in-flight stream', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerStreamHandler(streamOf('hang'), async () => {
        await new Promise((r) => setTimeout(r, 2_000));
        return { ok: true };
      });
      const pending = p.clientChannel.sendStream(streamOf('hang'), {}, Buffer.alloc(300_000, 7));
      const assertion = expect(pending).rejects.toThrow(/closed|timeout/i);
      await new Promise((r) => setTimeout(r, 80));
      p.serverWs.terminate();
      await assertion;
    } finally {
      await closePair(p);
    }
  });

  test('reply-with-stream resolves the request with bytes', async () => {
    const p = await createPair();
    try {
      const fileData = Buffer.from('manager-file-bytes');
      p.serverChannel.registerHandler(rpcOf('download-file'), (_payload, _ws, ctx) => {
        void p.serverChannel.replyWithStream(ctx?.id ?? '', streamOf('download-file'), {}, fileData);
        return DEFER_REPLY;
      });
      const res = await p.clientChannel.sendRequest(rpcOf('download-file'), {
        serverId: SERVER_ID,
        path: 'maps/x.msav',
      });
      expect(Buffer.isBuffer(res)).toBe(true);
      expect(res).toEqual(fileData);
    } finally {
      await closePair(p);
    }
  });

  test('reply-with-stream uses stream-reply kinds on the wire', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      const fileData = Buffer.from('wire-shape');
      p.serverChannel.registerHandler(rpcOf('download-file'), (_payload, _ws, ctx) => {
        void p.serverChannel.replyWithStream(ctx?.id ?? '', streamOf('dl-type'), {}, fileData);
        return DEFER_REPLY;
      });
      const res = await p.clientChannel.sendRequest(rpcOf('download-file'), {
        serverId: SERVER_ID,
        path: 'maps/x.msav',
      });
      expect(res).toEqual(fileData);
      const frames = parseAll(inbox.texts);
      const start = frames.find((m) => m.kind === 'stream-reply-start');
      const done = frames.find((m) => m.kind === 'stream-reply-done');
      expect(start).toMatchObject({ kind: 'stream-reply-start', type: 'dl-type' });
      expect(done).toMatchObject({ kind: 'stream-reply-done', type: 'dl-type' });
      expect(frames.filter((m) => m.kind === 'stream-start' || m.kind === 'stream-done')).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('reply-with-stream failure rejects with no extra frame', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      const fileData = Buffer.from('corrupt-me');
      p.serverChannel.registerHandler(rpcOf('download-file'), (_payload, _ws, ctx) => {
        const requestId = ctx?.id ?? '';
        void (async () => {
          const streamId = randomUUID();
          const sha = sha256Hex(fileData);
          sendJson(p.serverWs, {
            id: randomUUID(),
            kind: 'stream-reply-start',
            type: 'download-file',
            responseOf: requestId,
            payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha },
          });
          await sleep(50);
          const bad = Buffer.from(fileData);
          bad[0] ^= 0xff;
          p.serverWs.send(encodeChunk(streamId, 0, bad), { binary: true });
          sendJson(p.serverWs, {
            id: randomUUID(),
            kind: 'stream-reply-done',
            type: 'download-file',
            responseOf: requestId,
            payload: { streamId, sha256: sha },
          });
        })();
        return DEFER_REPLY;
      });
      await expect(
        p.clientChannel.sendRequest(rpcOf('download-file'), { serverId: SERVER_ID, path: 'maps/x.msav' }),
      ).rejects.toThrow(/checksum mismatch/i);
      const frames = parseAll(inbox.texts);
      expect(frames.filter((m) => m.kind === 'response' || m.kind === 'response-error')).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('encodeChunk keeps 1 empty chunk for zero bytes', () => {
    const frames = sliceIntoChunks('00000000-0000-4000-8000-000000000002', Buffer.alloc(0));
    expect(frames).toHaveLength(1);
    expect(frames[0].length).toBe(20);
  });
});

describe('RpcChannel envelope validation (v2)', () => {
  jest.setTimeout(20_000);

  test.each([
    ['unknown kind', { id: randomUUID(), kind: 'frob', type: 'x', payload: {} }],
    ['missing kind', { id: randomUUID(), type: 'x', payload: {} }],
    ['missing id', { kind: 'request', type: 'x', payload: {} }],
    ['request with event subject', { id: randomUUID(), kind: 'request', event: 'usage', payload: {} }],
    ['event frame with type subject', { id: randomUUID(), kind: 'event', type: 'usage', responseOf: randomUUID(), payload: {} }],
    ['stream-done with responseOf', { id: randomUUID(), kind: 'stream-done', type: 'raw', responseOf: randomUUID(), payload: { streamId: randomUUID(), sha256: '0'.repeat(64) } }],
  ])('%s is dropped with no reply', async (_label, frame) => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerHandler(rpcOf('x'), () => ({ ok: true }));
      sendJson(p.clientWs, frame);
      await sleep(250);
      expect(inbox.texts).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('unparsable JSON is dropped with no reply', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.clientWs.send('this is not json{{{');
      await sleep(250);
      expect(inbox.texts).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });
});
// ===== Event-stream tests (v2 listen family) =====

describe('RpcChannel event streams (loopback)', () => {
  jest.setTimeout(20_000);

  const subscribeParamsSchema = z.object({
    serverId: z.string().check(z.minLength(1)),
    interval: z.optional(z.number()),
  });

  test('listen is acknowledged with listening without invoking the handler', async () => {
    const p = await createPair();
    const serverInbox = collect(p.serverWs);
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (params) => {
        expect(params).toEqual({ serverId: 'srv-1', interval: 1000 });
      });

      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1', interval: 1000 }, (event) => {
        events.push(event);
      });

      // The ack is a dedicated listening frame, not an event.
      expect(events).toHaveLength(0);
      const listen = parseAll(serverInbox.texts).find((m) => m.kind === 'listen');
      expect(listen).toMatchObject({ kind: 'listen', event: 'usage' });
      expect(listen?.payload).toEqual({ data: { serverId: 'srv-1', interval: 1000 } });
      expect(listen).not.toHaveProperty('type');
    } finally {
      serverInbox.dispose();
      await closePair(p);
    }
  });

  test('subscribe handle unsubscribes and is confirmed by listen-ended', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async () => {});

      const handle = await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {});

      const serverInbox = collect(p.serverWs);
      const clientInbox = collect(p.clientWs);
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      handle.unsubscribe('handle done');

      await waitFor(() => serverInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'unlisten' && msg.responseOf === subId;
        } catch {
          return false;
        }
      }));
      const unlisten = parseAll(serverInbox.texts).find((m) => m.kind === 'unlisten');
      expect(unlisten).toMatchObject({ kind: 'unlisten', event: 'usage', responseOf: subId });
      await waitFor(() => clientInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'listen-ended' && msg.responseOf === subId;
        } catch {
          return false;
        }
      }));
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(0);
      serverInbox.dispose();
      clientInbox.dispose();
    } finally {
      await closePair(p);
    }
  });

  test('subscribe + event + unlisten confirmed by listen-ended', async () => {
    const p = await createPair();
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (params, handle) => {
        expect(params).toEqual({ serverId: 'srv-1', interval: 1000 });
        pushHandle = handle;
      });

      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1', interval: 1000 }, (event) => {
        events.push(event);
      });

      expect(pushHandle).not.toBeNull();
      pushHandle!.push({ cpu: 45, mem: '2GB', timestamp: '2026-10-06T12:00:00Z' });

      await waitFor(() => events.length === 1);
      expect(events[0]).toEqual({ cpu: 45, mem: '2GB', timestamp: '2026-10-06T12:00:00Z' });

      const serverInbox = collect(p.serverWs);
      const clientInbox = collect(p.clientWs);
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      p.clientChannel.unsubscribe(subId, 'test done');
      await waitFor(() => serverInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'unlisten' && msg.responseOf === subId;
        } catch {
          return false;
        }
      }));
      const unlisten = parseAll(serverInbox.texts).find((m) => m.kind === 'unlisten');
      expect(unlisten).toMatchObject({ kind: 'unlisten', event: 'usage', responseOf: subId });
      // Publisher confirms teardown with listen-ended.
      await waitFor(() => clientInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'listen-ended' && msg.responseOf === subId;
        } catch {
          return false;
        }
      }));
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(0);
      serverInbox.dispose();
      clientInbox.dispose();
    } finally {
      await closePair(p);
    }
  });

  test('server subscription handler validates params', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async () => {});

      await expect(
        p.clientChannel.subscribe(subOf('usage'), { interval: 1000 }, () => {}),
      ).rejects.toThrow(/Invalid event params/);

      await expect(
        p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1', interval: 'not-a-number' }, () => {}),
      ).rejects.toThrow(/Invalid event params/);
    } finally {
      await closePair(p);
    }
  });

  test('unknown event name rejects with listen-error', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      await expect(
        p.clientChannel.subscribe(subOf('ghost'), {}, () => {}),
      ).rejects.toThrow(/unknown event/);
      const frames = parseAll(inbox.texts);
      expect(frames.some((m) => m.kind === 'listen-error' && m.event === 'ghost')).toBe(true);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('server can push multiple events', async () => {
    const p = await createPair();
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        pushHandle = handle;
      });

      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, (event) => {
        events.push(event);
      });

      expect(pushHandle).not.toBeNull();
      pushHandle!.push({ cpu: 45, seq: 1 });
      pushHandle!.push({ cpu: 47, seq: 2 });
      pushHandle!.push({ cpu: 49, seq: 3 });

      await waitFor(() => events.length === 3);
      expect(events).toEqual([
        { cpu: 45, seq: 1 },
        { cpu: 47, seq: 2 },
        { cpu: 49, seq: 3 },
      ]);
    } finally {
      await closePair(p);
    }
  });

  test('server fail() sends listen-error and closes subscription', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        pushHandle = handle;
      });

      let closeFired = false;
      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, (event) => {
        events.push(event);
      });
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      p.clientChannel.onSubscriptionClose(subId, () => { closeFired = true; });

      expect(pushHandle).not.toBeNull();
      pushHandle!.fail('server shutting down');

      await waitFor(() => closeFired);
      const frames = parseAll(inbox.texts);
      expect(frames.some((m) => m.kind === 'listen-error' && m.responseOf === subId)).toBe(true);
      expect(p.clientChannel['subscriptions']['clientSubscriptions'].has(subId)).toBe(false);
      await sleep(100);
      expect(events).toHaveLength(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('server complete() sends listen-ended and closes subscription', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        pushHandle = handle;
      });

      let closeFired = false;
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {});
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      p.clientChannel.onSubscriptionClose(subId, () => { closeFired = true; });

      expect(pushHandle).not.toBeNull();
      pushHandle!.complete();

      await waitFor(() => closeFired);
      const frames = parseAll(inbox.texts);
      expect(frames.some((m) => m.kind === 'listen-ended' && m.responseOf === subId)).toBe(true);
      expect(p.clientChannel['subscriptions']['clientSubscriptions'].has(subId)).toBe(false);
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(0);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('subscription cleanup on connection close', async () => {
    const p = await createPair();
    try {
      let closed = false;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        handle.onClose(() => { closed = true; });
      });

      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {});

      p.serverWs.terminate();

      await sleep(200);
      expect(closed).toBe(true);
    } finally {
      await closePair(p);
    }
  });

  test('multiple concurrent listeners to same event', async () => {
    const p = await createPair();
    try {
      const handles: PushHandle[] = [];
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        handles.push(handle);
      });

      const events1: unknown[] = [];
      const events2: unknown[] = [];

      await Promise.all([
        p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1', tag: 'a' }, (event) => events1.push(event)),
        p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1', tag: 'b' }, (event) => events2.push(event)),
      ]);

      expect(handles).toHaveLength(2);

      handles[0].push({ tag: 'a', value: 1 });
      handles[1].push({ tag: 'b', value: 2 });

      await waitFor(() => events1.length === 1 && events2.length === 1);
      expect(events1[0]).toEqual({ tag: 'a', value: 1 });
      expect(events2[0]).toEqual({ tag: 'b', value: 2 });
    } finally {
      await closePair(p);
    }
  });

  test('onSubscriptionClose callback fires on unsubscribe', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async () => {});

      let closeFired = false;
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {});
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      p.clientChannel.onSubscriptionClose(subId, () => { closeFired = true; });

      p.clientChannel.unsubscribe(subId);
      await sleep(100);
      expect(closeFired).toBe(true);
    } finally {
      await closePair(p);
    }
  });

  test('onSubscriptionClose callback fires on server fail', async () => {
    const p = await createPair();
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', subscribeParamsSchema), async (_params, handle) => {
        pushHandle = handle;
      });

      let closeFired = false;
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {});
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      p.clientChannel.onSubscriptionClose(subId, () => { closeFired = true; });

      pushHandle!.fail('server error');
      await sleep(100);
      expect(closeFired).toBe(true);
    } finally {
      await closePair(p);
    }
  });
});
// ===== Java parity (v2 wire) =====

describe('RpcChannel Java parity', () => {
  jest.setTimeout(20_000);

  const parityParamsSchema = z.object({
    serverId: z.string().check(z.minLength(1)),
  });

  test('unlisten removes server slot and stops pushes, confirmed by listen-ended', async () => {
    const p = await createPair();
    const clientInbox = collect(p.clientWs);
    try {
      let pushHandle: PushHandle | null = null;
      p.serverChannel.registerSubscriptionHandler(subOf('usage', parityParamsSchema), async (_params, handle) => {
        pushHandle = handle;
      });

      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, (event) => {
        events.push(event);
      });
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      expect(pushHandle).not.toBeNull();
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(1);

      pushHandle!.push({ seq: 1 });
      await waitFor(() => events.length === 1);

      p.clientChannel.unsubscribe(subId, 'test done');
      await waitFor(() => p.serverChannel['subscriptions']['serverSubscriptions'].size === 0);
      await waitFor(() => clientInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'listen-ended' && msg.responseOf === subId;
        } catch {
          return false;
        }
      }));

      pushHandle!.push({ seq: 2 });
      await sleep(200);
      expect(events).toHaveLength(1);
    } finally {
      clientInbox.dispose();
      await closePair(p);
    }
  });

  test('unlisten with Java empty-object payload also cleans', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', parityParamsSchema), async () => {});
      const events: unknown[] = [];
      await p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, (event) => {
        events.push(event);
      });
      const subId = Array.from(p.clientChannel['subscriptions']['clientSubscriptions'].keys())[0];
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(1);

      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'unlisten',
        event: 'usage',
        payload: {},
        responseOf: subId,
      });
      await waitFor(() => p.serverChannel['subscriptions']['serverSubscriptions'].size === 0);
      expect(events).toHaveLength(0);
    } finally {
      await closePair(p);
    }
  });

  test('duplicate listen ID fails with listen-error and keeps original', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', parityParamsSchema), async () => {});
      const subId = randomUUID();
      sendJson(p.clientWs, {
        id: subId,
        kind: 'listen',
        event: 'usage',
        payload: { data: { serverId: 'srv-1' } },
      });
      await waitFor(() => findAnswer(inbox.texts, subId) !== null);
      expect(findAnswer(inbox.texts, subId)).toMatchObject({ kind: 'listening', event: 'usage' });
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(1);

      sendJson(p.clientWs, {
        id: subId,
        kind: 'listen',
        event: 'usage',
        payload: { data: { serverId: 'srv-1' } },
      });
      await waitFor(() => parseAll(inbox.texts).some((m) => m.kind === 'listen-error' && m.responseOf === subId));
      expect(p.serverChannel['subscriptions']['serverSubscriptions'].size).toBe(1);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('handler rejection removes slot and fails with detail', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerSubscriptionHandler(subOf('usage', parityParamsSchema), async () => {
        throw new Error('no such server');
      });
      await expect(
        p.clientChannel.subscribe(subOf('usage'), { serverId: 'srv-1' }, () => {}),
      ).rejects.toThrow(/no such server/);
      await waitFor(() => p.serverChannel['subscriptions']['serverSubscriptions'].size === 0);
    } finally {
      await closePair(p);
    }
  });

  test('malformed reply stream-start rejects linked request with no slot', async () => {
    const p = await createPair();
    try {
      p.serverChannel.registerHandler(rpcOf('download-file'), () => DEFER_REPLY);
      const pending = p.clientChannel.sendRequest(rpcOf('download-file'), {
        serverId: SERVER_ID,
        path: 'maps/x.msav',
      });
      const assertion = expect(pending).rejects.toThrow(/malformed reply stream start/i);
      await waitFor(() => p.clientChannel['pending'].size === 1);
      const requestId = Array.from(p.clientChannel['pending'].keys())[0];
      sendJson(p.serverWs, {
        id: randomUUID(),
        kind: 'stream-reply-start',
        type: 'download-file',
        responseOf: requestId,
        payload: { streamId: randomUUID(), metadata: {}, totalChunks: 0, sha256: sha256Hex(Buffer.from('x')) },
      });
      await assertion;
      expect(p.clientChannel['stream']['streamSlots'].size).toBe(0);
    } finally {
      await closePair(p);
    }
  });

  test('oversized chunk fails loud like FileChunkReceiver', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('raw'), () => ({ ok: true }));
      const streamId = randomUUID();
      const startId = randomUUID();
      const big = Buffer.alloc(70 * 1024, 0x41);
      const sha = sha256Hex(big);
      sendJson(p.clientWs, {
        id: startId,
        kind: 'stream-start',
        type: 'raw',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha },
      });
      await sleep(100);
      p.clientWs.send(encodeChunk(streamId, 0, big), { binary: true });
      await waitFor(() => findAnswer(inbox.texts, startId) !== null);
      expect(findAnswer(inbox.texts, startId)).toMatchObject({ kind: 'response-error' });
      expect(String(findAnswer(inbox.texts, startId)?.payload)).toMatch(/64kb/i);
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('duplicate chunk is ignored first-wins and still assembles', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('dup'), (_meta: unknown, bytes: Buffer) => ({ len: bytes.length }));
      const streamId = randomUUID();
      const startId = randomUUID();
      const data = Buffer.from('duplicate-bytes');
      const sha = sha256Hex(data);
      sendJson(p.clientWs, {
        id: startId,
        kind: 'stream-start',
        type: 'dup',
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha },
      });
      await sleep(100);
      p.clientWs.send(encodeChunk(streamId, 0, data), { binary: true });
      p.clientWs.send(encodeChunk(streamId, 0, data), { binary: true });
      await sleep(100);
      sendJson(p.clientWs, {
        id: randomUUID(),
        kind: 'stream-done',
        type: 'dup',
        payload: { streamId, sha256: sha },
      });
      await waitFor(() => findAnswer(inbox.texts, startId) !== null);
      expect(findAnswer(inbox.texts, startId)).toMatchObject({ kind: 'response', type: 'dup' });
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('abort carries kind stream-abort with type echo (Java abortStream parity)', async () => {
    const p = await createPair();
    const serverInbox = collect(p.serverWs);
    try {
      p.serverChannel.registerStreamHandler(streamOf('doc'), async () => {
        await new Promise((r) => setTimeout(r, 2_000));
        return { ok: true };
      });
      const pending = p.clientChannel.sendStream(streamOf('doc'), {}, Buffer.alloc(300_000, 7));
      const assertion = expect(pending).rejects.toThrow(/aborted-by-test/i);
      await sleep(150);
      const streamId = Array.from(p.clientChannel['stream']['outgoing'].keys())[0];
      expect(p.clientChannel.abortStream(streamId, 'doc', 'aborted-by-test')).toBe(true);
      // Second abort finds no state.
      expect(p.clientChannel.abortStream(streamId, 'doc', 'aborted-by-test')).toBe(false);
      await assertion;
      await waitFor(() => serverInbox.texts.some((t) => {
        try {
          const msg = JSON.parse(t) as WireFrame;
          return msg.kind === 'stream-abort';
        } catch {
          return false;
        }
      }));
      const abort = parseAll(serverInbox.texts).find((m) => m.kind === 'stream-abort');
      expect(abort).toMatchObject({ kind: 'stream-abort', type: 'doc' });
      expect(abort?.payload).toMatchObject({ streamId, reason: 'aborted-by-test' });
    } finally {
      serverInbox.dispose();
      await closePair(p);
    }
  });

  test('unregisterHandler removes dispatch', async () => {
    const p = await createPair();
    const inbox = collect(p.clientWs);
    try {
      p.serverChannel.registerHandler(rpcOf('get-state'), () => ({ ok: true }));
      p.serverChannel.unregisterHandler(rpcOf('get-state'));
      const id = randomUUID();
      sendJson(p.clientWs, { id, kind: 'request', type: 'get-state', payload: { serverId: SERVER_ID } });
      await waitFor(() => findAnswer(inbox.texts, id) !== null);
      expect(findAnswer(inbox.texts, id)).toMatchObject({ kind: 'response-error' });
    } finally {
      inbox.dispose();
      await closePair(p);
    }
  });

  test('stale close keeps the fresh connection (gateway guard)', async () => {
    const adapterHost = { httpAdapter: { getHttpServer: () => ({ on: () => undefined }) } };
    const notifier = { opened: jest.fn(), closed: jest.fn() };
    const registry = new ConnectionRegistry(notifier);
    const gateway = new ManagerGateway(
      adapterHost as unknown as import('@nestjs/core').HttpAdapterHost,
      {} as unknown as ManagerAuthenticator,
      registry,
    );

    const makeFakeWs = () => {
      const handlers = new Map<string, Array<() => void>>();
      return {
        handlers,
        readyState: 1,
        close: jest.fn(),
        send: jest.fn(),
        on: jest.fn((event: string, cb: () => void) => {
          const list = handlers.get(event) ?? [];
          list.push(cb);
          handlers.set(event, list);
        }),
        off: jest.fn(),
        fire: (event: string) => {
          for (const cb of handlers.get(event) ?? []) cb();
        },
      };
    };

    const oldWs = makeFakeWs();
    const newWs = makeFakeWs();
    gateway['registerConnection']('mgr-1', oldWs as unknown as WebSocket);
    gateway['registerConnection']('mgr-1', newWs as unknown as WebSocket);

    expect(oldWs.close).toHaveBeenCalledWith(4234, 'Replaced by new connection');
    expect(gateway.getChannel('mgr-1')).toBeDefined();

    oldWs.fire('close');
    expect(gateway.isOnline('mgr-1')).toBe(true);

    newWs.fire('close');
    expect(gateway.isOnline('mgr-1')).toBe(false);
  });

  test('outbound sends fail fast with no open session', async () => {
    const ws = new WebSocket('ws://127.0.0.1:1');
    ws.on('error', () => undefined);
    const channel = new RpcChannel(ws);
    try {
      expect(ws.readyState).not.toBe(WebSocket.OPEN);

      await expect(channel.sendRequest(rpcOf('get-state'), { serverId: SERVER_ID })).rejects.toThrow(
        /no open session/i,
      );
      await expect(channel.sendStream(streamOf('blob'), {}, Buffer.from('x'))).rejects.toThrow(
        /no open session/i,
      );
      await expect(
        channel.subscribe(subOf('usage'), { serverId: SERVER_ID }, () => undefined),
      ).rejects.toThrow(/no open session/i);
      expect(() => channel.sendNotification(rpcOf('remove-server'), { serverId: SERVER_ID })).not.toThrow();

      expect(channel['pending'].size).toBe(0);
      expect(channel['subscriptions']['clientSubscriptions'].size).toBe(0);
      expect(channel['stream']['streamSlots'].size).toBe(0);
    } finally {
      ws.terminate();
    }
  });

  test('abortStream refuses reply streams', async () => {
    const p = await createPair();
    const serverInbox = collect(p.serverWs);
    try {
      p.serverChannel.registerHandler(rpcOf('download-file'), () => DEFER_REPLY);
      const pending = p.clientChannel.sendRequest(rpcOf('download-file'), {
        serverId: SERVER_ID,
        path: 'maps/x.msav',
      });
      void pending.catch(() => undefined);
      await waitFor(() => p.clientChannel['pending'].size === 1);
      const requestId = Array.from(p.clientChannel['pending'].keys())[0];

      const streamId = randomUUID();
      const data = Buffer.from('partial-bytes');
      sendJson(p.serverWs, {
        id: randomUUID(),
        kind: 'stream-reply-start',
        type: 'download-file',
        responseOf: requestId,
        payload: { streamId, metadata: {}, totalChunks: 1, sha256: sha256Hex(data) },
      });
      await waitFor(() => p.clientChannel['stream']['streamSlots'].size === 1);

      expect(p.clientChannel.abortStream(streamId, 'download-file', 'not-abortable')).toBe(false);
      expect(p.clientChannel['stream']['streamSlots'].size).toBe(1);

      await sleep(150);
      expect(parseAll(serverInbox.texts).some((m) => m.kind === 'stream-abort')).toBe(false);
    } finally {
      serverInbox.dispose();
      await closePair(p);
    }
  });
});
