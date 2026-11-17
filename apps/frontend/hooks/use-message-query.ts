import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams } from '@mindustry-tool/api';
import type { CursorPaginationQuery } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod/v4-mini';
import { apiInstance } from '@/config/api';
import { useMessage } from '@/hooks/use-message';

const messageDataSchema = z.object({
	id: z.string(),
});

export const messageListSchema = z.array(messageDataSchema);

type MessageListType = typeof messageListSchema;

export function useMessageQuery<T extends ApiRouteDef<any, CursorPaginationQuery, any, MessageListType, any>, C extends RequestConfig>(
	props: {
		queryKey: string[];
		route: T;
	} & C &
		RequestParams<T> &
		RequestBody<T>,
) {
	const { queryKey, route } = props;
	const { setRenderReason } = useMessage();

	return useInfiniteQuery<
		z.infer<NonNullable<T['response']>>,
		Error,
		InfiniteData<z.infer<NonNullable<T['response']>>, z.infer<CursorPaginationQuery>>,
		string[],
		z.infer<CursorPaginationQuery>
	>({
		queryKey,
		initialPageParam: {
			size: 200,
			cursor: undefined,
		},
		queryFn: (context) => {
			const query = context.pageParam as z.infer<NonNullable<T['query']>>;

			const result = apiInstance.request(route, {
				...props,
				query,
			} );

			setRenderReason('fetch');

			return result as Promise<z.infer<NonNullable<T['response']>>>;
		},
		getNextPageParam: (
			lastPage: z.infer<NonNullable<T['response']>>,
			allPages: z.infer<NonNullable<T['response']>>[],
			lastPageParams: z.infer<CursorPaginationQuery>,
		) => {
			if (!lastPage || lastPage.length === 0 || lastPage.length < 100 || !allPages || allPages.length === 0) {
				return undefined;
			}

			const last = lastPage?.at(-1);

			if (!last) {
				return undefined;
			}

			return { ...lastPageParams, cursor: last.id ?? null };
		},
		refetchOnMount: 'always',
		refetchOnWindowFocus: 'always',
	});
}
