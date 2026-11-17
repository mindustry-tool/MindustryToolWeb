import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams, RequestQuery } from '@mindustry-tool/api';
import type { z } from 'zod/v4-mini';
import type { QueryParam } from '@/hooks/use-query-params';
import { useQuery } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { useQueryParams } from '@/hooks/use-query-params';
import { useEffect, useRef } from 'react';

export default function useSseQuery<T extends ApiRouteDef<any, any, any, any>>(
	props: {
		queryKey: string[];
		route: T;
		onNext?: (data: z.infer<NonNullable<T['response']>>) => void;
	} & Omit<Parameters<typeof useQuery>[0], 'queryFn'> &
		RequestConfig &
		RequestParams<T> &
		RequestQuery<T> &
		RequestBody<T> &
		(T['query'] extends undefined
			? {
					query?: undefined;
				}
			: {
					query: QueryParam<NonNullable<T['query']>>;
				}),
) {
	const { queryKey, route } = props;
	const q: z.infer<T['query']> | undefined = useQueryParams(props.query as QueryParam<T['query']>);
	const abortRef = useRef<AbortController>(new AbortController());

	const { data, ...rest } = useQuery({
		...props,
		queryKey: [...queryKey, q],
		queryFn: async ({ client, queryKey }) => {
			const config = { ...props, query: q };

			await apiInstance.sse(route, {
				signal: abortRef.current.signal,
				...config,
				onNext: (data) => {
					client.setQueryData(queryKey, (prev: z.infer<T['response']>[] | undefined) => [...(prev ?? []), data]);
					props?.onNext?.(data);
				},
			});

			return 'Nothing';
		},
		placeholderData: [],
	});

	useEffect(() => {
		const abortController = abortRef.current;

		return () => {
			abortController.abort();
			abortRef.current = new AbortController();
		};
	}, []);

	return { data, ...rest } as const;
}
