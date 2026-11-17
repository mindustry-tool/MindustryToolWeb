import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';

import TagBadge from '@/components/tag/tag-badge';

const MAX_DISPLAYED = 4;

type Props = {
	categories: TagCategoryWithTagsDto[];
	handleDeleteTag?: (item: TagCategoryWithTagsDto['tags'][number]) => void;
};

export default function TagBadgeContainer({ categories, handleDeleteTag }: Props) {
	return (
		<section className="flex shrink-0 gap-1">
			{categories?.slice(0, MAX_DISPLAYED).map((item) => (
				<TagBadge
					key={item.name}
					category={item}
					tag={item.tags[0]!}
					onDelete={handleDeleteTag && ((tag) => handleDeleteTag(tag))}
				/>
			))}
			{categories.length > MAX_DISPLAYED && (
				<span className="text-brand-foreground flex flex-nowrap items-center gap-0.5 rounded-full bg-green-400 px-2 py-1 text-center text-xs whitespace-nowrap">
					{categories.length - MAX_DISPLAYED}+
				</span>
			)}
		</section>
	);
}
