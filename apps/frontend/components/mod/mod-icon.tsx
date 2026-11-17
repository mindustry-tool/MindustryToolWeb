'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModIconProps = {
	iconUrl?: string | null;
	name?: string;
	className?: string;
	size?: number;
};

export function ModIcon({ iconUrl, name, className, size = 40 }: ModIconProps) {
	const [hasError, setHasError] = useState(false);

	if (iconUrl && !hasError) {
		return (
			<Image
				src={iconUrl}
				alt={name || 'Mod icon'}
				width={size}
				height={size}
				className={cn('rounded-md object-cover shrink-0 border border-border/50 bg-muted/20', className)}
				onError={() => setHasError(true)}
			/>
		);
	}

	return (
		<div
			style={{ width: size, height: size }}
			className={cn(
				'rounded-md shrink-0 flex items-center justify-center border border-border/50 bg-muted/40 text-muted-foreground',
				className,
			)}
			title={name}
		>
			<Package className="size-1/2 opacity-70" />
		</div>
	);
}
