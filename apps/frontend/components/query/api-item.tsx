'use client';

import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams, RequestReturnType } from '@mindustry-tool/api';
import { Suspense, type ReactNode } from 'react';
import type { QueryParam } from '@/hooks/use-query-params';
import { useQuery } from '@tanstack/react-query';
import ErrorMessage from '@/components/error/error-message';
import { apiInstance } from '@/config/api';
import { useQueryParams } from '@/hooks/use-query-params';
import { Tran } from '@/i18n/tran';
import { z } from 'zod/v4-mini';

export function ApiItem<T extends ApiRouteDef<any, any, any, any, any>, C extends RequestConfig>(
	props: {
		queryKey: string[];
		route: T;
		initialData?: RequestReturnType<T, C>;
		initialQuery?: z.infer<NonNullable<T['query']>>;
		error?: (error: Error) => ReactNode;
		loading?: () => ReactNode;
		empty?: () => ReactNode;
		children: (item: RequestReturnType<T, C>) => ReactNode;
		refetchOnWindowFocus?: boolean | 'always';
		refetchOnMount?: boolean | 'always';
	} & C &
		RequestParams<T> &
		RequestBody<T> &
		(T['query'] extends undefined ? { query?: undefined } : { query: QueryParam<NonNullable<T['query']>> }),
) {
	const { empty, error, loading, queryKey, route, initialData, initialQuery, refetchOnWindowFocus, refetchOnMount } =
		props;
	const q = useQueryParams<NonNullable<T['query']>>(props.query);

	const {
		data,
		isError,
		error: queryError,
		isLoading,
	} = useQuery<RequestReturnType<T, C>>({
		queryKey: [...queryKey, q],
		initialData: () => {
			if (Object.keys(q).length !== Object.keys(initialQuery || {}).length) {
				return undefined;
			}

			for (const key in q) {
				if (initialQuery?.[key] === undefined) {
					return undefined;
				}

				if (JSON.stringify(q[key]) !== JSON.stringify(initialQuery[key])) {
					return undefined;
				}
			}
			return initialData;
		},

		queryFn: () => {
			const config = { ...props, query: q };
			return apiInstance.request(route, config);
		},
		refetchOnWindowFocus,
		refetchOnMount,
	});

	if (isError) {
		return error ? error(queryError) : <ErrorMessage className="col-span-full" error={queryError} />;
	}

	const loader = loading && loading();

	if (isLoading) {
		return loader;
	}

	if (data == null || (Array.isArray(data) && data.length === 0)) {
		return empty ? (
			empty()
		) : (
			<div className="col-span-full text-center text-xl">
				<Tran text="no-data" />
			</div>
		);
	}

	return <Suspense fallback={loader}>{props.children(data)}</Suspense>;
}
