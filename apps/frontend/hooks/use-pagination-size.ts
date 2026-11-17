'use client';

import { DEFAULT_PAGINATION_SIZE } from '@mindustry-tool/api';
import { useLocalStorage } from 'usehooks-ts';

export const PAGINATION_SIZE_STORAGE_KEY = 'pagination-size';

export function usePaginationSize() {
	const [size, setSize] = useLocalStorage<number>(PAGINATION_SIZE_STORAGE_KEY, DEFAULT_PAGINATION_SIZE, {
		initializeWithValue: false,
	});

	const validSize =
		typeof size === 'number' && !Number.isNaN(size) && size > 0 ? size : Number(size) || DEFAULT_PAGINATION_SIZE;

	return [validSize, setSize] as const;
}

export default usePaginationSize;
