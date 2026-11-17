import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';

export type FilterTag = TagCategoryWithTagsDto['tags'][number];

export type FilterTagProps = {
	filter: string;
	value: TagCategoryWithTagsDto[];
	tags: TagCategoryWithTagsDto[];
	className?: string;
	onValueChange: (value: TagCategoryWithTagsDto[]) => void;
};
