import type { ItemType } from '@mindustry-tool/api';
import type { PlanetDto } from '@mindustry-tool/api';
import type { SearchDialogProps } from './search-bar.types';
import { api } from '@mindustry-tool/api';

import { useQuery } from '@tanstack/react-query';

import { Suspense, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { SearchInput } from '@/components/common/search-input';
import PlanetSelector from '@/components/query/planet-selector';
import AuthorSelector from '@/components/search-bar/author-selector';
import TagSelector from '@/components/tag/tag-selector';
import { Separator } from '@/components/ui/separator';
import { useSearchStates } from '@/hooks/use-search-states';
import { useTagFromQuery } from '@/hooks/use-tag-from-query';
import { Tran } from '@/i18n/tran';
import { apiInstance } from '@/config/api';

export default function FilterDialog({ tags, author }: SearchDialogProps) {
	const [input, setInput] = useState('');
	const [searchState, setSearchState] = useSearchStates();

	const { data } = useQuery({
		queryKey: ['planets'],
		queryFn: () => apiInstance.request(api.v4.planets.findAll, {}),
	});

	return (
		<div className="space-y-4 overflow-y-auto p-1">
			<SearchInput value={input} onChange={setInput} />
			{author && (
				<section className="space-y-2">
					<Tran className="font-semibold" text="author" />
					<Separator />
					<AuthorSelector
						value={searchState.author}
						onChange={(authorId) => setSearchState({ author: authorId ?? '' })}
					/>
				</section>
			)}
			{tags && (
				<section className="space-y-2">
					<Tran className="font-semibold" text="tags" />
					<Separator />
					{data && (
						<Suspense>
							<TagSection
								input={input}
								value={searchState.tags}
								type={tags}
								planets={data}
								onChange={(tags) => setSearchState({ tags })}
							/>
						</Suspense>
					)}
				</section>
			)}
		</div>
	);
}

type TagsSectionProps = {
	input: string;
	value: string[];
	type: ItemType;
	planets: PlanetDto[];
	onChange: (tags: string[]) => void;
};

function TagSection({ input, value, type, planets, onChange }: TagsSectionProps) {
	const [planetId, setPlanetId] = useLocalStorage<string[]>(
		'plannets',
		planets.slice(0, 2).map((planet) => planet.id),
	);
	const { tags, fromQuery } = useTagFromQuery(type, planetId, value);

	return (
		<div className='space-y-2'>
			<PlanetSelector type="multiple" value={planetId} onValueSelected={setPlanetId} />
			<Separator />
			<Suspense>
				<TagSelector
					filter={input}
					value={fromQuery}
					tags={tags}
					onValueChange={(groups) =>
						onChange(groups.flatMap((group) => group.tags.map((tag) => `${group.name}_${tag.name}`)))
					}
				/>
			</Suspense>
		</div>
	);
}
