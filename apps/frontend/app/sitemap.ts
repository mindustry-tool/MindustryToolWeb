import { apiInstance } from '@/config/api';
import environment from '@/config/environment';
import { api } from '@mindustry-tool/api';
import { LOCALES } from '@mindustry-tool/api';
import type { MetadataRoute } from 'next';

const routes = ['schematics', 'maps', 'posts', 'servers', 'upload/schematic', 'upload/map', 'upload/post'];

async function schematicSitemap(): Promise<MetadataRoute.Sitemap> {
	const [[bestSchematics], [latestSchematics]] = await Promise.all([
		apiInstance.tryRequest(api.v4.schematics.findAll, {
			query: {
				page: 0,
				size: 200,
				sort: 'download-count_desc',
			},
		}),
		apiInstance.tryRequest(api.v4.schematics.findAll, {
			query: {
				page: 0,
				size: 200,
				sort: 'time_desc',
			},
		}),
	]);

	const schematics = bestSchematics ? [...bestSchematics] : [];
	const latestList = latestSchematics ?? [];

	for (const schematic of latestList) {
		if (!schematics.find((item) => item.id === schematic.id)) {
			schematics.push(schematic);
		}
	}

	return schematics.map(({ itemId }) => ({
		url: `${environment.url.base}/en/schematics/${itemId}`,
		changeFrequency: 'weekly',
		lastModified: new Date(),
		images: [`${environment.url.apiV4}/schematics/${itemId}/image.png`],
		alternates: {
			languages: Object.fromEntries(LOCALES.map((lang) => [lang, `${environment.url.base}/${lang}/schematics/${itemId}`])),
		},
	}));
}
async function mapSitemap(): Promise<MetadataRoute.Sitemap> {
	const [[bestMaps], [latestMaps]] = await Promise.all([
		apiInstance.tryRequest(api.v4.maps.findAll, {
			query: {
				page: 0,
				size: 200,
				sort: 'download-count_desc',
			},
		}),
		apiInstance.tryRequest(api.v4.maps.findAll, {
			query: {
				page: 0,
				size: 200,
				sort: 'time_desc',
			},
		}),
	]);

	const maps = bestMaps ? [...bestMaps] : [];
	const latestList = latestMaps ?? [];

	for (const map of latestList) {
		if (!maps.find((item) => item.id === map.id)) {
			maps.push(map);
		}
	}

	return maps.map(({ itemId }) => ({
		url: `${environment.url.base}/en/maps/${itemId}`,
		changeFrequency: 'weekly',
		lastModified: new Date(),
		images: [`${environment.url.apiV4}/maps/${itemId}/image.png`],
		alternates: {
			languages: Object.fromEntries(LOCALES.map((lang) => [lang, `${environment.url.base}/${lang}/maps/${itemId}`])),
		},
	}));
}

async function postSitemap(): Promise<MetadataRoute.Sitemap> {
	const [data] = await apiInstance.tryRequest(api.v4.posts.findAll, {
		query: {
			page: 0,
			size: 100,
		},
	});

	const posts = data ?? [];

	return posts.map(({ itemId, cover }) => ({
		url: `${environment.url.base}/en/posts/${itemId}`,
		changeFrequency: 'weekly',
		lastModified: new Date(),
		images: cover ? [cover] : [],
		alternates: {
			languages: Object.fromEntries(LOCALES.map((lang) => [lang, `${environment.url.base}/${lang}/posts/${itemId}`])),
		},
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [maps, schematics, posts] = await Promise.all([mapSitemap(), schematicSitemap(), postSitemap()]);

	const defaultSitemap: MetadataRoute.Sitemap = routes.map((route) => ({
		url: `${environment.url.base}/en/${route}`,
		alternates: {
			languages: Object.fromEntries(LOCALES.map((lang) => [lang, `${environment.url.base}/${lang}/${route}`])),
		},
	}));

	return [...defaultSitemap, ...maps, ...schematics, ...posts];
}
