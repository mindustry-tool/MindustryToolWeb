'use client';

import { Search, X } from 'lucide-react';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function SearchInput({
	className,
	onChange,
	value,
	...props
}: Omit<React.ComponentProps<'input'>, 'onChange'> & {
	onChange: (value: string) => void;
}) {
	const { t } = useI18n();

	return (
		<div className={cn('flex relative items-center w-full max-w-100 min-h-9', className)}>
			<Search
				size={18}
				className="absolute top-1/2 left-2 -translate-y-1/2 transition-[color,box-shadow] peer-focus-visible:border-ring peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
			/>
			<Input
				className="box-border flex rounded-lg py-0 pl-8"
				{...props}
				value={value}
				placeholder={t('search')}
                aria-label={t('search')}
				onChange={(event) => onChange(event.target.value)}
				autoFocus={false}
			/>
			{!!value && (
				<Button
					className="absolute top-1/2 right-2 -translate-y-1/2"
					variant="ghost"
					size="icon"
					onClick={() => onChange('')}
				>
					<X />
				</Button>
			)}
		</div>
	);
}

export { SearchInput };
