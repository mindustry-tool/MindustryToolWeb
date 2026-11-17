'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SuggestionInputProps = {
	className?: string;
	value: string;
	values: readonly string[];
	onChange: (value: string) => void;
	placeholder?: string;
};

export default function SuggestionInput({ className, value, values, onChange, placeholder }: SuggestionInputProps) {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState(value);

	React.useEffect(() => {
		setTimeout(() => {
			setInputValue(value);
		}, 0);
	}, [value]);

	const filteredValues = React.useMemo(
		() => (inputValue ? values.filter((v) => v.toLowerCase().includes(inputValue.toLowerCase())) : values),
		[inputValue, values],
	);

	return (
		<div className={cn('relative', className)}>
			<Input
				value={inputValue}
				onChange={(e) => {
					setInputValue(e.target.value);
					onChange(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onBlur={() => setTimeout(() => setOpen(false), 200)}
				placeholder={placeholder}
				role="combobox"
				aria-expanded={open}
				aria-autocomplete="list"
			/>
			{open && filteredValues.length > 0 && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
					{filteredValues.map((v) => (
						<div
							key={v}
							className={cn(
								'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
								{ 'bg-accent text-accent-foreground': value === v },
							)}
							onMouseDown={(e) => {
								e.preventDefault();
								setInputValue(v);
								onChange(v);
								setOpen(false);
							}}
						>
							{v}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
