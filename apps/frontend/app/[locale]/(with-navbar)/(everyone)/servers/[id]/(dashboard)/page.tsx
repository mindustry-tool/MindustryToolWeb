import { api } from '@mindustry-tool/api';
import { stripColors } from '@mindustry-tool/api';

import { cache } from 'react';
import { ServerError } from '@/components/server/server-fetch-state';
import { apiInstance } from '@/config/api';
import { Metadata } from 'next';
import { throwNotFound } from '@/lib/error.utils';
import { formatTitle } from '@/lib/string.utils';
import environment from '@/config/environment';
import { generateAlternate } from '@/lib/i18n.util';
import { Dashboard } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/(dashboard)/components/dashboard';

const getCachedServer = cache((id: string) =>
	apiInstance.tryRequest(api.v4.servers.get, {
		params: {
			id,
		},
	}),
);

export async function generateMetadata({ params }: PageProps<'/[locale]/servers/[id]'>): Promise<Metadata> {
	const { id } = await params;

	const [data, error] = await getCachedServer(id);

	if (error) {
		return {
			title: String(error),
		};
	}

	const { name, description } = data;

	return {
		title: formatTitle(stripColors(name)),
		description: stripColors(description || ''),
		openGraph: {
			type: 'article',
			title: stripColors(name),
			description: stripColors(description || ''),
			images: `${environment.url.apiV4}/servers/${id}/image`,
		},
		alternates: generateAlternate(`/servers/${id}`),
	};
}

export default async function Page({ params }: PageProps<'/[locale]/servers/[id]'>) {
	const { id } = await params;

	const [data, error] = await getCachedServer(id);

	throwNotFound(error);

	if (error) {
		return <ServerError error={error} />;
	}

	return <Dashboard server={data} />;
}
