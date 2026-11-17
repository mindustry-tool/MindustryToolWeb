import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';
import type { HTMLAttributes } from 'react';

import { XIcon } from 'lucide-react';
import { useCallback } from 'react';

import TagIcon from '@/components/tag/tag-icon';
import { TagName } from '@/components/tag/tag-name';
import { tagStyle } from '@/lib/string.utils';
import { cn } from '@/lib/utils';

type TagBadgeProps = HTMLAttributes<HTMLSpanElement> & {
	category: TagCategoryWithTagsDto;
	tag: TagCategoryWithTagsDto['tags'][number];
	onDelete?: (tag: TagCategoryWithTagsDto['tags'][number]) => void;
};

export default TagBadge;

function TagBadge({ category, tag, className, onDelete, ...props }: TagBadgeProps) {
	const { color } = category;
	const { icon } = tag;

	const hasDelete = !!onDelete;

	const handleOnDelete = useCallback(
		(value: TagCategoryWithTagsDto['tags'][number]) => {
			if (onDelete) {
				onDelete(value);
			}
		},
		[onDelete],
	);

	return (
		<div
			className={cn(
				'flex cursor-pointer items-center gap-0.5 flex-nowrap whitespace-nowrap rounded-full px-2 py-1 text-center text-xs text-brand-foreground group',
				className,
			)}
			style={tagStyle(color)}
			onClick={() => handleOnDelete(tag)}
			{...props}
		>
			<TagIcon>{icon}</TagIcon>
			<TagName>{category.name}</TagName>
			<TagName>{tag.name}</TagName>
			{hasDelete && <XIcon className="hidden size-4 group-hover:block group-focus:block" />}
		</div>
	);
}
