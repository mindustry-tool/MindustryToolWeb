import type { ItemType } from '@mindustry-tool/api';
import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiInstance } from '@/config/api';

export function useTagFromQuery(type: ItemType, planetIds: string[], tagQuery: string[]) {
	const { data } = useQuery({
		queryKey: ['all-tag', type],
		queryFn: () =>
			apiInstance.request(api.v4.tags.findAll, {
				query: {
					group: type,
				},
			}),
	});

	const tags = useMemo(
		() =>
			data
				? data.map(cat => ({
						...cat,
						tags: cat.tags.filter(t => t.planetIds.length === 0 || planetIds.some(id => t.planetIds.includes(id))),
				  }))
				: [],
		[data, planetIds],
	);
	const fromQuery: TagCategoryWithTagsDto[] = [];

	for (const tagAsString of tagQuery) {
		const parts = tagAsString.split('_');

		if (parts.length !== 2) {
			continue;
		}

		const [currentCategory, currentTag] = parts;

		const category = tags.find(category => category.name === currentCategory);

		if (!category) {
			continue;
		}

		const tag = category.tags.find(tag => tag.name === currentTag);

		if (!tag) {
			continue;
		}

		const exists = fromQuery.find(e => e.name === category.name);
		if (exists) {
			exists.tags.push({ ...tag });
		} else {
			fromQuery.push({ ...category, tags: [{ ...tag }] });
		}
	}

	return { tags, fromQuery };
}
