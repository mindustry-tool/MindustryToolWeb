import type { ItemTagDto } from '@mindustry-tool/api';
import { X } from 'lucide-react';
import TagIcon from '@/components/tag/tag-icon';
import { TagName } from '@/components/tag/tag-name';
import { Button } from '@/components/ui/button';
import { tagStyle } from '@/lib/string.utils';

export function TagCard({
	tag,
	onClick,
}: {
	tag: Pick<ItemTagDto, 'color' | 'icon' | 'fullTag'>;
	onClick?: () => void;
}) {
	const [category, tagName] = tag.fullTag.split('_');

	return (
		<div
			className="inline-flex bg-muted h-7 w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3"
			style={tagStyle(tag.color)}
		>
			<TagIcon>{tag.icon}</TagIcon>
			<TagName>{category!}</TagName>
			<TagName>{tagName!}</TagName>
			{onClick && (
				<Button variant="none" size="none" onClick={onClick}>
					<X />
				</Button>
			)}
		</div>
	);
}
