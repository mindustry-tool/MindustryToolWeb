'use client';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Ellipsis } from 'lucide-react';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const ellipsisVariants = cva('p-0', {
	variants: {
		variant: {
			default: '',
			ghost: 'aspect-square',
			secondary: 'border-secondary bg-secondary',
            outline: 'border border-outline',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

type Props = Pick<React.ComponentProps<typeof Button>, 'size' | 'children' | 'className'> &
	VariantProps<typeof ellipsisVariants> & React.ComponentProps<'button'>;
const EllipsisButton = ({ className, variant, children, ...props }: Props) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant={variant} className={cn(ellipsisVariants({ className, variant }))} type="button" {...props}>
					<Ellipsis className="size-4" />
				</Button>
			</PopoverTrigger>
			<Suspense>
				<PopoverContent className="p-0" asChild>
					{children && <div className="m-1 grid gap-1 rounded-md border bg-card p-1 text-sm">{children}</div>}
				</PopoverContent>
			</Suspense>
		</Popover>
	);
};

export { EllipsisButton };
