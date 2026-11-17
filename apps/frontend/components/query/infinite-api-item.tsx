'use client';

import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams } from '@mindustry-tool/api';
import type { PaginationQuery } from '@mindustry-tool/api';

import type { ReactElement, ReactNode } from 'react';
import type { z, ZodMiniArray, ZodMiniObject } from 'zod/v4-mini';
import type { QueryParam } from '@/hooks/use-query-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import ErrorMessage from '@/components/error/error-message';
import { apiInstance } from '@/config/api';
import { useQueryParams } from '@/hooks/use-query-params';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/spinner/loading-spinner';

export function InfiniteApiItem<T extends ApiRouteDef<ZodMiniObject, PaginationQuery, any, ZodMiniArray, any>>(
	props: {
		className?: string;
		queryKey: string[];
		route: T;
		query: QueryParam<NonNullable<T['query']>>;
		error?: (error: Error) => ReactNode;
		loading?: () => ReactElement;
		empty?: () => ReactNode;
		end?: () => ReactNode;
		children: (pages: z.infer<NonNullable<T['response']>>[]) => ReactNode;
		refetchOnWindowFocus?: boolean | 'always';
		refetchOnMount?: boolean | 'always';
		staleTime?: number;
		initialData?: z.infer<NonNullable<T['response']>>[];
	} & RequestConfig &
		RequestParams<T> &
		RequestBody<T>,
) {
	const { end, empty, error, loading, queryKey, className, route, query, refetchOnWindowFocus, refetchOnMount, staleTime, initialData } = props;

	const q = useQueryParams<NonNullable<T['query']>>(query);

	const { page: _page, ...restQuery } = q;

	const {
		data,
		isError,
		error: queryError,
		hasNextPage,
		isFetching,
		isRefetching,
		fetchNextPage,
	} = useInfiniteQuery({
		queryKey: [...queryKey, restQuery],
		initialPageParam: q,
		initialData: initialData ? { pages: initialData, pageParams: [q] } : undefined,
		getNextPageParam: (
			lastPage: z.infer<NonNullable<T['response']>>,
			allPages: z.infer<NonNullable<T['response']>>[],
			lastPageParams: z.infer<NonNullable<T['query']>>,
		) => {
			if ((lastPage?.length ?? 0) < q.size) {
				return undefined;
			}

			return { ...lastPageParams, page: allPages.length };
		},
		queryFn: ({ pageParam }) => {
			const config = {
				...props,
				query: {
					...q,
					...(pageParam as NonNullable<T['query']>),
				},
			};

			return apiInstance.request(route, config) as Promise<z.infer<NonNullable<T['response']>>>;
		},
		refetchOnWindowFocus,
		refetchOnMount,
		staleTime,
	});

	const loader = loading ? loading() : <LoadingSpinner className="col-span-full" />;

	if (isError) {
		return error ? error(queryError) : <ErrorMessage error={queryError} />;
	}

	return (
		<InfiniteScroll
			className={cn(className)}
			loadMore={() => {
				if (!isFetching) {
					fetchNextPage();
				}
			}}
			hasMore={hasNextPage}
			useWindow={false}
		>
			<Suspense fallback={loader}>
				{props.children(data?.pages || [])}
				{isFetching && !isRefetching && loader}
				{(!data || data.pages.length === 0 || data.pages[0]!.length === 0) && !isFetching && empty && empty()}
				{!hasNextPage && end && end()}
			</Suspense>
		</InfiniteScroll>
	);
}
