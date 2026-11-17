'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { SearchInput } from '@/components/common/search-input';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';

export function WikiSearchInput() {
	const [q, setQ] = useState('');

	const { isLoading } = useQuery({
		queryKey: [q],
		queryFn: () => new Promise((res) => setTimeout(res, 1000)),
	});

	return (
		<>
			<VisuallyHidden>
				<DialogTitle />
				<DialogDescription />
			</VisuallyHidden>
			<SearchInput className="h-10 max-w-none border-none ring-0" value={q} onChange={setQ}></SearchInput>
			<div className="absolute bottom-0 translate-y-full">
				{isLoading && (
					<div className="bg-card transition-opacity duration-150">
						<LoadingSpinner />
					</div>
				)}
			</div>
		</>
	);
}
