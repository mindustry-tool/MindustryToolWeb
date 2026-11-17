import type { TagDto } from '@mindustry-tool/api';
import { TagCard } from '@/components/tag/tag-card';
import { cn } from '@/lib/utils';

type SelectedTag = Pick<TagDto, 'id' | 'color' | 'icon' | 'fullTag' | 'position' | 'categoryId'>;

export function TagContainer({ tags, className }: { className?: string; tags: SelectedTag[] }) {
	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{tags
				.sort((a, b) => a.position - b.position)
				.sort((a, b) => a.categoryId.localeCompare(b.categoryId))
				.map((tag) => (
					<TagCard key={tag.id} tag={tag} />
				))}
		</div>
	);
}
