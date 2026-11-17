/* eslint-disable react-hooks/refs */
import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams } from '@mindustry-tool/api';
import type { CursorPaginationQuery } from '@mindustry-tool/api';

import type { z } from 'zod/v4-mini';
import type { messageListSchema } from '@/hooks/use-message-query';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useInterval } from 'usehooks-ts';
import { useMessageQuery } from '@/hooks/use-message-query';
import { cn, isEndReached } from '@/lib/utils';
import { useMessage } from '@/hooks/use-message';

export default function MessageList<
	T extends ApiRouteDef<any, CursorPaginationQuery, any, typeof messageListSchema, any>,
	C extends RequestConfig,
>(
	props: {
		queryKey: string[];
		route: T;
		className?: string;
		children: (
			props: { items: z.infer<NonNullable<T['response']>>; ref: React.Ref<HTMLDivElement> } & ReturnType<
				typeof useMessageQuery<T, C>
			>,
		) => React.ReactNode;
	} & C &
		RequestParams<T> &
		RequestBody<T>,
) {
	const { className, children } = props;
	const { renderReason } = useMessage();

	const query = useMessageQuery(props);

	const { data, fetchNextPage, isFetching, hasNextPage } = query;

	const container = useRef<HTMLDivElement>(null);
	const list = useRef<HTMLDivElement>(null);

	const scrollTopRef = useRef(0);
	const lastHeightRef = useRef(0);
	const didInitialScroll = useRef(false);

	const endReached = isEndReached(list.current, 1000);

	const currentContainer = container.current;
	const currentList = list.current;

	const scrollHeight = list.current?.scrollHeight || 0;
	const lastHeight = lastHeightRef.current || 0;
	const scrollTop = currentList?.scrollTop || 0;

	// Only preserve scroll position when user scroll up
	if (scrollHeight != lastHeight && currentList && renderReason.current === 'fetch') {
		const diff = scrollHeight - lastHeight + scrollTop;

		currentList.scrollTop = diff;
	} else if (endReached && renderReason.current === 'event' && currentList) {
		// Scroll to bottom
		setTimeout(() => {
			currentList.scrollTo({
				top: currentList.scrollHeight,
				behavior: 'smooth',
			});
		}, 100);
	}

	scrollTopRef.current = currentContainer?.scrollTop || 0;
	lastHeightRef.current = scrollHeight;

	const attemptToFetch = useCallback(() => {
		const handleTopReach = () => {
			if (!hasNextPage || isFetching) {
				return;
			}

			fetchNextPage();
		};

		if (list.current && list.current.scrollTop <= 1000) {
			handleTopReach();
		}
	}, [fetchNextPage, hasNextPage, isFetching]);

	useInterval(() => attemptToFetch(), 1000);

	useEffect(() => {
		const currentContainer = container.current;

		function onScroll() {
			attemptToFetch();
		}

		currentContainer?.addEventListener('scrollend', onScroll);
		currentContainer?.addEventListener('scroll', onScroll);

		const l = list.current;

		l?.addEventListener('scroll', onScroll);

		return () => {
			currentContainer?.removeEventListener('scrollend', onScroll);
			currentContainer?.removeEventListener('scroll', onScroll);

			l?.removeEventListener('scroll', onScroll);
		};
	}, [attemptToFetch]);

	const items = useMemo(() => data?.pages?.flatMap((page) => page)?.toReversed() || [], [data]) as z.infer<
		NonNullable<T['response']>
	>;

	useLayoutEffect(() => {
		const el = list.current;

		if (!el || items.length === 0 || didInitialScroll.current) {
			return;
		}

		didInitialScroll.current = true;

		el.scrollTop = el.scrollHeight;
	}, [items.length]);
	return (
		<div
			className={cn('flex h-full flex-col justify-end w-full overflow-x-hidden relative rounded-xs', className)}
			ref={container}
		>
			{children({ items, ref: list, ...query })}
		</div>
	);
}
