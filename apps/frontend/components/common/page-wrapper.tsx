import { cn } from '@/lib/utils';
import React from 'react';

export function PageWrapper({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex h-full w-full flex-col gap-2 overflow-hidden p-2', className)} {...props}>
			{children}
		</div>
	);
}

export function PageFooter({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex items-center gap-2', className)} {...props}>
			{children}
		</div>
	);
}

export function PageHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex items-center gap-2', className)} {...props}>
			{children}
		</div>
	);
}

export function PageContent({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col gap-2', className)} {...props}>
			{children}
		</div>
	);
}
