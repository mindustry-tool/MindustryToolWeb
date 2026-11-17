import { cn } from '@/lib/utils';

export function Container({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'overflow-y-auto container overflow-x-hidden mx-auto relative p-4 space-y-4 w-full h-full',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
