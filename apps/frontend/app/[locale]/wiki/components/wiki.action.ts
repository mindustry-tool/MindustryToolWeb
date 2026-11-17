import { api } from '@mindustry-tool/api';
import { Locale } from '@mindustry-tool/api';

import { apiInstance } from '@/config/api';
import { buildTree } from '@/lib/wiki-tree';

export async function getWikiList(language: Locale) {
	return await apiInstance.tryRequest(api.v4.wiki.view, {
		query: {
			language,
		},
		next: {
			revalidate: 60 * 60 * 24,
			tags: ['wiki', 'post'],
		},
	});
}

export const getWikiTree = async (language: Locale) => {
	const [data, error] = await getWikiList(language);

	if (error) {
		return [null, error] as const;
	}

	const tree = buildTree(data);

	return [
		{
			list: data,
			tree,
		},
		null,
	] as const;
};
