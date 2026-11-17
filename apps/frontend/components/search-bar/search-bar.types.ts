import type { ItemType, SORT_TAGS, SortTag } from '@mindustry-tool/api';
import type { ReactNode } from 'react';

export type SearchDialogProps = {
	sorts?: SortTag[] | typeof SORT_TAGS;
	tags?: ItemType;
	author?: boolean;
	size?: boolean;
	className?: string;
	children?: ReactNode;
};

export type Mode = 'name' | 'tags' | 'author' | 'width';
