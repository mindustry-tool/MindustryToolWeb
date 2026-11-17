import { cn } from '@/lib/utils';

export function Item({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col gap-2 rounded-md border bg-card p-2 text-card-foreground', className)} {...props}>
			{children}
		</div>
	);
}

export function ItemTitle({ className, children, ...props }: React.ComponentProps<'span'>) {
	return (
		<span className={cn('text-xl font-semibold capitalize', className)} {...props}>
			{children}
		</span>
	);
}

export function ItemDescription({ className, children, ...props }: React.ComponentProps<'span'>) {
	return (
		<span className={cn('text-sm text-muted-foreground', className)} {...props}>
			{children}
		</span>
	);
}

export function ItemContainer({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col gap-2', className)} {...props}>
			{children}
		</div>
	);
}
