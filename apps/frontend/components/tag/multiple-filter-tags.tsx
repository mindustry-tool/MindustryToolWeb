import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';

import { Check } from 'lucide-react';
import type { FilterTag } from './tag-selector.types';
import TagIcon from '@/components/tag/tag-icon';
import { TagName } from '@/components/tag/tag-name';
import { useTagConfig } from '@/hooks/use-tag-config';
import { cn } from '@/lib/utils';

type MultipleFilerTagsProps = {
	group: TagCategoryWithTagsDto;
	selectedValue: FilterTag[];
	handleTagGroupChange: (value: FilterTag[]) => void;
};

export default function MultipleFilerTags({ group, selectedValue, handleTagGroupChange }: MultipleFilerTagsProps) {
	const { showTagName, showTagNumber } = useTagConfig();

	const handleClick = (value: FilterTag) => {
		const index = selectedValue.map((v) => v.name).indexOf(value.name);
		if (index === -1) {
			handleTagGroupChange([...selectedValue, value]);
		} else {
			handleTagGroupChange([...selectedValue.slice(0, index), ...selectedValue.slice(index + 1)]);
		}
	};

	return (
		<div className="flex w-full flex-wrap items-center gap-1">
			{group.tags.map((value) => {
				const isSelected = selectedValue.map((v) => v.name).includes(value.name);

				return (
					<button
						key={value.id}
						type="button"
						onClick={() => handleClick(value)}
						className={cn(
							'inline-flex items-center gap-1 h-6.5 rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer transition-all duration-150 select-none shrink-0',
							isSelected
								? 'border-primary/60 bg-primary/20 text-primary-foreground font-semibold shadow-xs'
								: 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:border-border',
						)}
					>
						{isSelected ? (
							<Check className="size-3.5 shrink-0 text-primary" />
						) : (
							<TagIcon className="size-3.5 shrink-0 object-contain">{value.icon}</TagIcon>
						)}
						{(!value.icon || showTagName) && <TagName className="capitalize">{value.name}</TagName>}
						{showTagNumber && (
							<span className="font-mono text-[10px] opacity-70">
								({value.count})
							</span>
						)}
					</button>
				);
			})}
		</div>
	);

}

