import type { ItemType } from '@mindustry-tool/api';
import { useLocalStorage } from 'usehooks-ts';
import PlanetSelector from '@/components/query/planet-selector';
import { DropdownCard } from '@/components/search-bar/dropdown-card';
import TagSelector from '@/components/tag/tag-selector';
import { Separator } from '@/components/ui/separator';
import { useTagFromQuery } from '@/hooks/use-tag-from-query';

type TagsDropdownProps = {
	input: string;
	value: string[];
	type: ItemType;
	onChange: (tags: string[]) => void;
};

export default function TagsDropdown({ input, type, value, onChange }: TagsDropdownProps) {
	const [planetId, setPlanetId] = useLocalStorage<string[]>('plannets', []);
	const { tags, fromQuery } = useTagFromQuery(type, planetId, value);

	return (
		<DropdownCard>
			<PlanetSelector type="multiple" value={planetId} onValueSelected={setPlanetId} />
			<Separator />
			<TagSelector
				filter={input}
				value={fromQuery}
				tags={tags}
				onValueChange={(groups) =>
					onChange(groups.flatMap((group) => group.tags.map((tag) => `${group.name}_${tag.name}`)))
				}
			/>
		</DropdownCard>
	);
}
