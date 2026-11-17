'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type Orientation = 'horizontal' | 'vertical';

export type SeparatorProps = {
	orientation?: Orientation
	decorative?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export const Separator = ({ ref, decorative, orientation = 'vertical', className, ...divProps }: SeparatorProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
		const ariaOrientation = orientation === 'vertical' ? orientation : undefined;
		const semanticProps = decorative ? { role: 'none' } : { 'aria-orientation': ariaOrientation, role: 'separator' };

		return <div className={cn(className)} data-orientation={orientation} {...semanticProps} {...divProps} ref={ref} />;
	};

Separator.displayName = 'Separator';
