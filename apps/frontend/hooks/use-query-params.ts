import type { z } from 'zod/v4-mini';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { usePaginationSize } from '@/hooks/use-pagination-size';
import { type QueryParam, mergeQueryParams } from '@/lib/query-params';

export type { QueryParam };

export function useQueryParams<TQuery>(queryParam: QueryParam<TQuery> | undefined): z.infer<TQuery> {
	const searchParams = useSearchParams();
	const [size] = usePaginationSize();

	const query = useMemo(() => {
		const result = mergeQueryParams(searchParams, queryParam);
		if (result && typeof result === 'object' && !(result instanceof URLSearchParams) && 'size' in result) {
			(result as Record<string, unknown>).size = size;
		}
		return result;
	}, [searchParams, queryParam, size]);

	return query as z.infer<TQuery>;
}
