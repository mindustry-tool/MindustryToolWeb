'use client';

import React, { ReactNode, useCallback, useRef, forwardRef } from 'react';

import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import { cn } from '@/lib/utils';

type Props = {
	id?: string;
	className?: string;
	children: ReactNode;
} & React.ComponentProps<'div'>;

const ScrollContainer = forwardRef<HTMLDivElement, Props>(({ className, id, children, onScroll, ...rest }, ref) => {
	const innerRef = useRef<HTMLDivElement>(null);

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			innerRef.current = node;

			if (typeof ref === 'function') {
				ref(node);
			} else if (ref) {
				(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
			}
		},
		[ref],
	);

	useScrollRestoration(innerRef, { id });

	return (
		<div
			{...rest}
			ref={setRefs}
			className={cn('scroll-container h-full overflow-y-auto w-full flex flex-col gap-2 scrollbar-gutter-stable', className)}
			onScroll={onScroll}
		>
			{children}
		</div>
	);
});

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;
