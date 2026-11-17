'use client';

import React from 'react';
import { usePaginationSize } from '@/hooks/use-pagination-size';

export function Skeletons({ ...props }: { number?: number; children: React.ReactNode }) {
	const [size] = usePaginationSize();

	return Array.from({ length: props.number ?? size }).map((_, index) => (
		<React.Fragment key={index}>{props.children}</React.Fragment>
	));
}
