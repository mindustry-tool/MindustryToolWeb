'use client';

import type { KeyboardEventHandler } from 'react';
import { DEFAULT_SORT_TAG } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Filter, Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { parseAsInteger, useQueryState } from 'nuqs';
import { memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import ComboBox from '@/components/combo-box/combo-box';
import { SearchQueries } from '@/components/search-bar/search-queries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { useSearchQueries } from '@/hooks/use-search-queries';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

const FilterDialog = dynamic(() => import('@/components/search-bar/filter-dialog'));

import type { SearchDialogProps, Mode } from './search-bar.types';
export type { SearchDialogProps, Mode };

export function SearchBar(props: SearchDialogProps) {
	const { className, sorts = [], children } = props;
	const { t } = useI18n();

	const { query, searchState, setSearchState } = useSearchQueries();
	const urlName = searchState.name;

	const [inputValue, setInputValue] = useState(urlName);
	const prevUrlNameRef = useRef(urlName);

	const [sortQuery, setSortQuery] = useQueryState('sort', {
		defaultValue: DEFAULT_SORT_TAG,
	});
	const [, setPage] = useQueryState('page', parseAsInteger.withDefault(0));

	const inputRef = useRef<HTMLInputElement>(null);

	// Debounce committing text query to URL (300ms) to avoid URL/route refetch thrashing
	const debouncedUpdateUrl = useDebounceCallback((value: string) => {
		prevUrlNameRef.current = value;
		setSearchState({ name: value });
	}, 300);

	// Sync external URL changes to local input state (e.g. browser back/forward or resets)
	useEffect(() => {
		if (prevUrlNameRef.current !== urlName) {
			prevUrlNameRef.current = urlName;
			setInputValue(urlName);
		}
	}, [urlName]);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const nextValue = event.target.value;
			setInputValue(nextValue);
			debouncedUpdateUrl(nextValue);
		},
		[debouncedUpdateUrl],
	);

	const handleClear = useCallback(() => {
		debouncedUpdateUrl.cancel();
		setInputValue('');
		prevUrlNameRef.current = '';
		setSearchState({ name: '' });
		inputRef.current?.focus();
	}, [debouncedUpdateUrl, setSearchState]);

	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.key === 'Enter') {
				debouncedUpdateUrl.cancel();
				const trimmed = inputValue.trim();
				prevUrlNameRef.current = trimmed;
				setSearchState({ name: trimmed });
			} else if (event.key === 'Escape') {
				if (inputValue) {
					debouncedUpdateUrl.cancel();
					setInputValue('');
					prevUrlNameRef.current = '';
					setSearchState({ name: '' });
				} else {
					inputRef.current?.blur();
				}
			} else if (event.key === 'Backspace' && inputValue === '') {
				if (query.length > 0) {
					query[query.length - 1]?.remove();
				}
			}
		},
		[debouncedUpdateUrl, inputValue, query, setSearchState],
	);

	const handleSortChange = useCallback(
		(value: string) => {
			setSortQuery(value || DEFAULT_SORT_TAG);
			setPage(0);
		},
		[setSortQuery, setPage],
	);

	return (
		<div className={cn('w-full', className)}>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-1 items-center gap-2">
					<div
						className="group flex min-h-9 flex-1 cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1 text-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 max-w-sm"
						onClick={() => inputRef.current?.focus()}
					>
						<Search className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
						{query.length > 0 && <SearchQueries query={query} itemType={props.tags} />}
						<input
							className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
							value={inputValue}
							onChange={handleInputChange}
							ref={inputRef}
							onKeyDown={handleKeyDown}
							placeholder={t('search', { defaultValue: 'Search...' })}
							aria-label={t('search', { defaultValue: 'Search' })}
							autoFocus={false}
							autoComplete="off"
							spellCheck={false}
						/>
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								handleClear();
							}}
							className={cn(
								'flex size-5 shrink-0 items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-opacity hover:text-foreground focus:outline-none',
								inputValue ? 'opacity-100' : 'invisible pointer-events-none',
							)}
							aria-label={t('clear-search')}
							aria-hidden={!inputValue}
							tabIndex={inputValue ? 0 : -1}
						>
							<X className="size-3.5" />
						</button>
					</div>
					<Dialog>
						<DialogTrigger asChild>
							<Button className="shrink-0 border bg-card" variant="secondary" 							aria-label={t('filter')} size="icon">
								<Filter className="size-4" />
							</Button>
						</DialogTrigger>
						<Suspense>
							<DialogContent className="flex h-dvh max-w-[calc(100dvh-32px)] flex-col md:h-[calc(100dvh-32px)] md:max-w-[calc(100dvh-32px)]">
								<DialogTitle className="p-1">
									<Tran text="filter" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<FilterDialog {...props} />
							</DialogContent>
						</Suspense>
					</Dialog>
				</div>
				<div className="flex items-center gap-2 sm:ml-auto">
					<Suspense>
						{sorts.length > 0 && (
							<SortDropdown sorts={sorts} sortQuery={sortQuery} setSortQuery={handleSortChange} />
						)}
					</Suspense>
					{children}
				</div>
			</div>
		</div>
	);
}


const SortDropdown = memo(function SortDropdown({
	sorts,
	sortQuery,
	setSortQuery,
}: {
	sorts: SearchDialogProps['sorts'];
	sortQuery: string;
	setSortQuery: (value: string) => void;
}) {
	const { t } = useI18n();

	return (
		<ComboBox
			className="w-auto flex-1 bg-card"
			required
			value={sortQuery}
			values={(sorts as unknown as string[]) || DEFAULT_SORT_TAG}
			onChange={(value) => setSortQuery(value || DEFAULT_SORT_TAG)}
			render={(v) => (
				<span key={v} className="text-nowrap">
					{t(v)}
				</span>
			)}
		/>
	);
});
