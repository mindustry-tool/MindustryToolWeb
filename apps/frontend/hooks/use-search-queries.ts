import type { Mode } from '@/components/search-bar/search-bar.types';
import { useCallback, useMemo, useState } from 'react';
import { useSearchStates } from '@/hooks/use-search-states';

export type SearchQuery = {
	mode: Mode;
	value: string | number;
	isSelected: boolean;
	select: () => void;
	remove: () => void;
};

export function useSearchQueries(options?: {
	setMode?: (mode: Mode | undefined) => void;
	setInput?: (input: string) => void;
}) {
	const { setMode } = options || {};
	const [searchState, setSearchState] = useSearchStates();
	const [selectedQuery, setSelectedQuery] = useState<SearchQuery>();

	const query = useMemo(() => {
		const result: SearchQuery[] = [];

		const { tags, ...rest } = searchState satisfies Record<Mode, string | string[]>;

		if (tags) {
			tags.forEach((tag) => {
				const val = {
					mode: 'tags' as Mode,
					value: tag,
					isSelected: selectedQuery?.mode === 'tags' && selectedQuery.value === tag,
					select: () => {},
					remove: () => {
						setSearchState({ tags: tags.filter((t) => t !== tag) });
					},
				};

				result.push(val);

				val.select = () => {
					setSelectedQuery(val);
					setMode?.('tags');
				};
			});
		}

		for (const key in rest) {
			if (key === 'page' || key === 'name') continue;

			const value = rest[key as keyof typeof rest];

			if (value && value !== '') {
				const val = {
					mode: key as Mode,
					value,
					isSelected: selectedQuery?.mode === (key as Mode) && selectedQuery.value === value,
					select: () => {},
					remove: () => {
						setSearchState({ [key]: '' });
						setMode?.(undefined);
					},
				};

				result.push(val);

				val.select = () => {
					setMode?.(key as Mode);
					setSelectedQuery(val);
				};
			}
		}

		return result;
	}, [searchState, selectedQuery, setSearchState, setMode]);

	const handleSearchState: typeof setSearchState = useCallback(
		(state) => setSearchState({ ...state, page: 0 }),
		[setSearchState],
	);

	return {
		selectedQuery,
		query,
		searchState,
		setSearchState: handleSearchState,
	};
}
