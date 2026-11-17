import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams, RequestQuery } from '@mindustry-tool/api';
import type { z } from 'zod/v4-mini';
import type { QueryParam } from '@/hooks/use-query-params';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { apiInstance } from '@/config/api';
import { useQueryParams } from '@/hooks/use-query-params';

export default function useSseMutation<T extends ApiRouteDef<any, any, any, any, any>>(
	props: {
		queryKey: string[];
		route: T;
		mutation: Omit<Parameters<typeof useMutation>[0], 'mutationFn'>;
	} & RequestConfig &
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
	const { queryKey, route, mutation } = props;

	const q: z.infer<NonNullable<T['query']>> = useQueryParams(props.query as QueryParam<NonNullable<T['query']>>);
	const [data, setData] = useState<z.infer<NonNullable<T['response']>>[]>([]);

	const { data: _, ...rest } = useMutation({
		...props,
		...mutation,
		onMutate(variables, context) {
			setData([]);
			mutation.onMutate?.(variables, context);
		},
		mutationKey: [...queryKey, q],
		mutationFn: async () => {
			const config = { ...props, query: q };

			await apiInstance.sse(route, {
				...config,
				onNext: (data) => {
					setData((prev) => [...prev, data]);
				},
			});

			return 'Nothing';
		},
	});

	return { data, ...rest } as const;
}
