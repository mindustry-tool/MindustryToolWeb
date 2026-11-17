'use client';

import { useEffect, useRef } from 'react';
import type { AutocompleteSuggestion } from './use-terminal-autocomplete';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface AutocompletePopoverProps {
	suggestions: AutocompleteSuggestion[];
	highlightedIndex: number;
	onSelect: (suggestion: AutocompleteSuggestion) => void;
	onHoverIndex?: (index: number) => void;
}

export function AutocompletePopover({
	suggestions,
	highlightedIndex,
	onSelect,
	onHoverIndex,
}: AutocompletePopoverProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const activeItemRef = useRef<HTMLButtonElement>(null);

	// Scroll active item into view when highlightedIndex changes
	useEffect(() => {
		if (activeItemRef.current) {
			activeItemRef.current.scrollIntoView({ block: 'nearest' });
		}
	}, [highlightedIndex]);

	if (suggestions.length === 0) {
		return null;
	}

	return (
		<div
			ref={listRef}
			className="absolute bottom-full left-0 right-0 mb-1.5 max-h-[50dvh] overflow-y-auto p-1.5 bg-card/95 backdrop-blur-md border rounded-md shadow-lg z-50 flex flex-col gap-1"
			role="listbox"
			aria-label="Autocomplete suggestions"
		>
			{suggestions.map((item, index) => {
				const isHighlighted = index === highlightedIndex;

				return (
					<button
						key={item.id}
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
							'w-full text-left px-2.5 py-1.5 rounded-sm flex flex-col gap-0.5 cursor-pointer transition-colors',
							isHighlighted ? 'bg-accent text-accent-foreground ring-1 ring-ring/30' : 'hover:bg-muted/70',
						)}
					>
						<div className="flex items-center justify-between w-full gap-2">
							<div className="flex items-center gap-2 overflow-hidden">
								<span className="font-semibold text-sm truncate">{item.title}</span>
								{item.subtitle && (
									<span className="text-xs text-muted-foreground font-mono truncate">{item.subtitle}</span>
								)}
							</div>
							<div className="flex items-center gap-1.5 shrink-0">
								{item.badge && (
									<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
										{item.badge}
									</Badge>
								)}
								<span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 px-1 py-0.5 rounded bg-muted/50">
									{item.category}
								</span>
							</div>
						</div>
						{item.description && (
							<span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
