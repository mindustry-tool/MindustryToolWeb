import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
	{
		variants: {
			variant: {
				default: 'border border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				destructive:
					'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost:
					'hover:bg-accent hover:text-accent-foreground data-[active-state=on]:bg-accent data-[active-state=on]:text-accent-foreground hover:data-[active-state=on]:bg-accent hover:data-[active-state=on]:hover:bg-accent dark:hover:bg-accent/50 dark:data-[active-state=on]:bg-accent/50 dark:hover:data-[active-state=on]:bg-accent/50',
				command:
					'text-foreground hover:bg-primary hover:text-primary-foreground data-[active-state=on]:bg-primary data-[active-state=on]:text-primary-foreground hover:data-[active-state=on]:bg-primary hover:data-[active-state=on]:hover:bg-primary',
				'command-destructive': 'text-destructive hover:bg-accent',
				link: 'text-primary underline-offset-4 hover:underline',
				none: '',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 gap-1 rounded-md px-3 has-[>svg]:px-2.5',
				xs: 'h-6 gap-1 rounded-sm px-2 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
				none: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	type = 'button',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp data-slot="button" type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
	);
}

export { Button, buttonVariants };
