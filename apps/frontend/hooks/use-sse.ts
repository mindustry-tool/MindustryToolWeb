import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams, RequestQuery } from '@mindustry-tool/api';
import type { z } from 'zod/v4-mini';
import { useEffect, useRef, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { apiInstance } from '@/config/api';

type SseState = 'connecting' | 'connected' | 'disconnected';

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 5000;

export default function useSse<
	T extends ApiRouteDef<z.ZodMiniObject, z.ZodMiniObject, z.ZodMiniType, z.ZodMiniType, string>,
>(
	props: {
		route: T;
		onEvent: (data: z.infer<NonNullable<T['response']>>) => void;
		enabled?: boolean;
	} & RequestConfig &
		RequestParams<T> &
		RequestQuery<T> &
		RequestBody<T>,
) {
	const { route, onEvent } = props;
	const [state, setState] = useState<SseState>('connecting');
	const abort = useRef<AbortController | undefined>(undefined);

	const query = useRef<Promise<void> | undefined>(undefined);
	const attemptRef = useRef(0);
	const nextConnectTimeRef = useRef(0);

	useInterval(() => {
		if (props.enabled === false) {
			abort.current?.abort();
			query.current = undefined;
			setState('disconnected');
			return;
		}

		if (query.current !== undefined) {
			return;
		}

		if (Date.now() < nextConnectTimeRef.current) {
			return;
		}

		const controller = new AbortController();

		abort.current?.abort();
		abort.current = controller;

		setState('connecting');

		const sseOptions = {
			...props,
			onNext: (data: z.infer<NonNullable<T['response']>>) => {
				attemptRef.current = 0;
				onEvent(data);
			},
			onConnect: () => {
				attemptRef.current = 0;
				setState('connected');
			},
			signal: controller.signal,
		};

		query.current = apiInstance
			.sse(route, sseOptions)
			.catch(() => {
				const backoff = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attemptRef.current), MAX_BACKOFF_MS);
				attemptRef.current += 1;
				nextConnectTimeRef.current = Date.now() + backoff;
				setState('disconnected');
			})
			.finally(() => {
				query.current = undefined;
			});
	}, 10);

	useEffect(() => {
		return () => {
			if (abort.current && !abort.current.signal.aborted) {
				abort.current.abort();
			}
		};
	}, []);

	return { state };
}
