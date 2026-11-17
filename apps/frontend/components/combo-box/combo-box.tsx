'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

type ComboBoxProps<T> = {
	className?: string;
	values: readonly T[];
	empty?: React.ReactNode;
	portal?: boolean;
	icon?: boolean;
} & (
	| {
			required: true;
			value: NoInfer<T>;
			onChange: (value: NoInfer<T>) => void;
			render?: (value: NoInfer<T>) => React.ReactNode;
	  }
	| {
			required?: false;
			value?: NoInfer<T>;
			onChange: (value?: NoInfer<T>) => void;
			render?: (value: NoInfer<T | undefined | null>) => React.ReactNode;
	  }
);

export default function ComboBox<T = string>({
	className,
	values,
	value,
	required,
	portal = true,
	icon = true,
	onChange,
	render = (value: NoInfer<T | undefined | null>) => (
		<span className="text-nowrap" key={String(value)}>
			{String(value)}
		</span>
	),
	empty,
}: ComboBoxProps<T>) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
                    aria-label='select'
					className={cn(
						'w-37.5 justify-between border border-input transition-colors',
						{
							'border-primary': open,
						},
						className,
					)}
				>
					{value ? render(value as T) : (empty ?? <Tran text="select" />)}
					{icon && <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="max-h-[40vh] h-full w-75 max-w-[90vw] space-y-1 overflow-y-auto p-2"
				portal={portal}
			>
				{values.map((v) => (
					<div
						className={cn('flex items-center justify-between py-1 px-2 hover:bg-muted rounded-md', {
							'bg-muted': value === v,
						})}
						key={JSON.stringify(v)}
						onClick={(event) => {
							if (required) {
								onChange(v === value ? value : (v as T));
							} else {
								onChange(v === value ? undefined : (v as T));
							}
							setOpen(false);
							event.preventDefault();
							event.stopPropagation();
						}}
					>
						{render(v)}
						<CheckIcon className={cn('mr-2 h-4 w-4', value === v ? 'opacity-100' : 'opacity-0')} />
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}
