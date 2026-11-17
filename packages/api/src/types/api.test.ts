import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiInstance, defineApiRoute } from './api.js';

describe('ApiInstance skipResponseValidation', () => {
	const testRoute = defineApiRoute({
		path: '/test',
		method: 'GET',
		response: z.object({
			name: z.string(),
			count: z.number(),
		}),
	});

	const rawData = { name: 'sample', count: 42, extraField: 'ignored-or-invalid' };

	it('parses response through zod by default', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(rawData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		const api = new ApiInstance({ baseUrl: 'https://example.com' });
		const result = await api.request(testRoute, {});

		expect(result).toEqual({ name: 'sample', count: 42 });
		vi.unstubAllGlobals();
	});

	it('bypasses zod response parse when skipResponseValidation is true on instance', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(rawData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		const api = new ApiInstance({
			baseUrl: 'https://example.com',
			skipResponseValidation: true,
		});
		const result = await api.request(testRoute, {});

		expect(result).toEqual(rawData);
		vi.unstubAllGlobals();
	});

	it('bypasses zod response parse when skipResponseValidation is true per-request', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(rawData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		const api = new ApiInstance({ baseUrl: 'https://example.com' });
		const result = await api.request(testRoute, { skipResponseValidation: true });

		expect(result).toEqual(rawData);
		vi.unstubAllGlobals();
	});
});

describe('ApiInstance sse protocol handling', () => {
	const streamRoute = defineApiRoute({
		path: '/stream',
		method: 'GET',
		response: z.object({
			type: z.literal('message'),
			content: z.string(),
		}),
	});

	it('sends Accept: text/event-stream header and ignores comment, heartbeat, and ping events', async () => {
		const sseBody = [
			'event: comment\ndata: "Connected"\n\n',
			'event: heartbeat\ndata: "heartbeat"\n\n',
			'event: ping\ndata: "ping"\n\n',
			`data: ${JSON.stringify({ type: 'message', content: 'hello world' })}\n\n`,
		].join('');

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode(sseBody));
				controller.close();
			},
		});

		let capturedHeaders: HeadersInit | undefined;
		const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
			capturedHeaders = init?.headers;
			return Promise.resolve(
				new Response(stream, {
					status: 200,
					headers: { 'Content-Type': 'text/event-stream' },
				}),
			);
		});
		vi.stubGlobal('fetch', fetchMock);

		const received: Array<{ type: 'message'; content: string }> = [];
		const api = new ApiInstance({ baseUrl: 'https://example.com' });

		await api.sse(streamRoute, {
			onNext: (item) => {
				received.push(item);
			},
		});

		expect(capturedHeaders).toMatchObject({
			Accept: 'text/event-stream',
		});
		expect(received).toEqual([{ type: 'message', content: 'hello world' }]);
		vi.unstubAllGlobals();
	});
});
