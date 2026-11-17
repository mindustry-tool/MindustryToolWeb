'use client';

import type { ApiRouteDef, RequestBody, RequestConfig, RequestParams } from '@mindustry-tool/api';
import type { z, ZodMiniNumber } from 'zod/v4-mini';
import type { QueryParam } from '@/hooks/use-query-params';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Ellipsis } from 'lucide-react';

import { parseAsInteger, useQueryState } from 'nuqs';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ComboBox from '@/components/combo-box/combo-box';
import ErrorMessage from '@/components/error/error-message';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiInstance } from '@/config/api';
import { usePaginationSize } from '@/hooks/use-pagination-size';
import { useQueryParams } from '@/hooks/use-query-params';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

export function ApiPagination<T extends ApiRouteDef<any, any, any, ZodMiniNumber>, C extends RequestConfig>(
	props: {
		queryKey: string[];
		route: T;
		className?: string;
		shallow?: boolean;
	} & C &
		RequestParams<T> &
		RequestBody<T> &
		(T['query'] extends undefined
			? {
					query?: undefined;
				}
			: {
					query: QueryParam<NonNullable<T['query']>>;
				}),
) {
	const { className, queryKey, route, shallow = true } = props;
	const { t } = useI18n();
	const [size, setSize] = usePaginationSize();
	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0).withOptions({ shallow }));

	const q = useQueryParams<NonNullable<T['query']>>(props.query);

	const { data, isError, error } = useQuery({
		queryKey: ['count', ...queryKey, q, size],
		queryFn: () => apiInstance.request(route, { ...props, query: q }),
	});

	const total = (data ?? 0) as z.infer<NonNullable<T['response']>>;
	const lastPage = Math.max(Math.ceil(total / size) - 1, 0);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const tag = target?.tagName.toLowerCase();

			if (tag === 'input' || tag === 'textarea') return;

			if (e.key === 'ArrowLeft') {
				setPage(Math.max(page - 1, 0));
			}
			if (e.key === 'ArrowRight') {
				setPage(Math.min(page + 1, lastPage));
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [lastPage, page, setPage]);

	const handlePageChange = useCallback(
		(nextPage: number) => {
			setPage(nextPage);

			const scrollContainers = document.getElementsByClassName('scroll-container');
			if (scrollContainers) {
				for (const container of scrollContainers) {
					container.scrollTo({
						top: 0,
						behavior: 'smooth',
					});
				}
			}
		},
		[setPage],
	);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<div className={cn(`grid grid-cols-7 gap-1`, className)}>
			<PaginationItem disabled={page === 0} page={0} setPage={handlePageChange}>
				<ChevronsLeft />
			</PaginationItem>
			<PaginationItem disabled={page === Math.max(page - 1, 0)} page={Math.max(page - 1, 0)} setPage={handlePageChange}>
				<ChevronLeft />
			</PaginationItem>
			<PaginationItem variant="default" page={page} setPage={handlePageChange}>
				{page}
			</PaginationItem>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="ghost" size="icon" aria-label={t('navigate-config')}>
						<Ellipsis />
					</Button>
				</DialogTrigger>
				<Suspense>
					<DialogContent>
						<DialogTitle>
							<Tran text="go" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription></DialogDescription>
						</VisuallyHidden>
						<GoToDialog
							page={page}
							setPage={setPage}
							size={size}
							setSize={setSize}
							lastPage={lastPage}
						/>
					</DialogContent>
				</Suspense>
			</Dialog>
			<PaginationItem disabled={page === lastPage} page={lastPage} setPage={handlePageChange}>
				{lastPage}
			</PaginationItem>
			<PaginationItem
				disabled={page === Math.min(page + 1, lastPage)}
				page={Math.min(page + 1, lastPage)}
				setPage={handlePageChange}
			>
				<ChevronRight />
			</PaginationItem>
			<PaginationItem disabled={page === lastPage} page={lastPage} setPage={handlePageChange}>
				<ChevronsRight />
			</PaginationItem>
		</div>
	);
}

function PaginationItem({
	page,
	setPage,
	children,
	...props
}: { page: number; setPage: (page: number) => void } & React.ComponentProps<typeof Button>) {
	const { t } = useI18n();
	return (
		<Button
			className="text-xs"
			aria-label={t('navigate')}
			variant="ghost"
			size="icon"
			{...props}
			onClick={() => setPage(page)}
		>
			{children}
		</Button>
	);
}

function GoToDialog({
	lastPage,
	page,
	setPage,
	size,
	setSize,
}: {
	page: number;
	setPage: (page: number) => void;
	size: number;
	setSize: (size: number) => void;
	lastPage: number;
}) {
	const [goto, setGoto] = useState(page);

	const handleGoTo = (page: number, size: number) => {
		setSize(size);
		setPage(Math.min(page, lastPage));
	};

	return (
		<>
			<div className="grid items-center gap-2 text-muted-foreground">
				<Tran text="page" />
				<Input value={goto || 0} type="number" onChange={(event) => setGoto(event.target.valueAsNumber)} />
				<Tran text="limit" />
				<ComboBox
					required
					values={['10', '20', '30', '50', '100'] as string[]}
					value={size.toString()}
					onChange={(value) => handleGoTo(goto, Number.parseInt(value))}
				/>
			</div>
			<div className="flex justify-end">
				<DialogClose onClick={() => handleGoTo(goto, size)} asChild>
					<Button>
						<Tran text="go" />
					</Button>
				</DialogClose>
			</div>
		</>
	);
}
