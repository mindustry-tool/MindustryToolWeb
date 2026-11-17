'use client';

import { useEffect, useRef } from 'react';
import { History, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface HistoryPopoverProps {
	histories: string[];
	isOpen: boolean;
	highlightedIndex: number;
	onSelect: (item: string) => void;
	onClose: () => void;
	onHoverIndex?: (index: number) => void;
}

export function HistoryPopover({
	histories,
	isOpen,
	highlightedIndex,
	onSelect,
	onClose,
	onHoverIndex,
}: HistoryPopoverProps) {
	const activeItemRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (activeItemRef.current) {
			activeItemRef.current.scrollIntoView({ block: 'nearest' });
		}
	}, [highlightedIndex]);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="absolute bottom-full left-0 right-0 mb-1.5 max-h-[50dvh] overflow-y-auto p-2 bg-card/95 backdrop-blur-md border rounded-md shadow-xl z-50 flex flex-col gap-1.5"
			role="listbox"
			aria-label="Command History"
		>
			<div className="flex items-center justify-between pb-1 border-b px-1">
				<div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
					<History className="size-3.5" />
					<span>Command History ({histories.length})</span>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-5 rounded p-0 text-muted-foreground hover:text-foreground"
					onClick={onClose}
				>
					<X className="size-3.5" />
				</Button>
			</div>

			{histories.length === 0 ? (
				<div className="py-6 text-center text-xs text-muted-foreground italic">No command history yet</div>
			) : (
				<div className="flex flex-col gap-1">
					{histories.map((item, index) => {
						const isHighlighted = index === highlightedIndex;

						return (
							<button
								key={index}
								ref={isHighlighted ? activeItemRef : null}
								type="button"
								tabIndex={-1}
								role="option"
								aria-selected={isHighlighted}
								onClick={(e) => {
									e.preventDefault();
									onSelect(item);
								}}
								onMouseEnter={() => onHoverIndex?.(index)}
								className={cn(
									'w-full text-left px-2.5 py-1.5 rounded-sm font-mono text-xs cursor-pointer transition-colors truncate',
									isHighlighted
										? 'bg-accent text-accent-foreground ring-1 ring-ring/30'
										: 'hover:bg-muted/70 text-foreground',
								)}
							>
								{item}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
