'use client';

import ColorText from '@/components/common/color-text';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function AliasPopover({ names }: { names: string[] }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Badge
					variant="secondary"
					className="cursor-pointer text-[10px] px-1.5 py-0 h-4 font-mono shrink-0"
					title="Known aliases"
					onClick={(e) => e.stopPropagation()}
				>
					+{names.length - 1}
				</Badge>
			</PopoverTrigger>
			<PopoverContent className="w-60 p-2.5 text-xs bg-popover border" onClick={(e) => e.stopPropagation()}>
				<div className="font-semibold mb-1.5 text-muted-foreground text-[11px]">
					Known Aliases ({names.length})
				</div>
				<div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
					{names.map((name, i) => (
						<div key={i} className="px-2 py-1 rounded bg-muted text-xs truncate">
							<ColorText text={name} />
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
