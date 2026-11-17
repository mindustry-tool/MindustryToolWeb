import { api } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { CrashDetailsView } from './components/crash-details-view';
import { Metadata } from 'next';

type Props = {
	params: Promise<{ mod: string; id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	try {
		const { id, locale } = await params;
		const crash = await apiInstance.request(api.v4.crashes.get, {
			params: { id },
		});

		const title = crash.modName
			? `Crash Report: ${crash.modName}`
			: crash.mod
				? `Crash Report: ${crash.mod}`
				: `Crash Report ${crash.id.slice(0, 8)}`;

		const description = crash.stacktrace || 'No error message provided';

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				locale,
				type: 'article',
				siteName: 'Mindustry Tool',
				section: 'Crash Reports',
				publishedTime: crash.createdAt.toISOString(),
				modifiedTime: crash.updatedAt?.toISOString() || undefined,
			},
			twitter: {
				card: 'summary',
				title,
				description,
			},
		};
	} catch {
		return {
			title: 'Crash Report Not Found',
			description: 'The requested crash report could not be found.',
		};
	}
}

export default async function Page({ params }: Props) {
	const { id } = await params;
	let initialData = undefined;
	try {
		initialData = await apiInstance.request(api.v4.crashes.get, {
			params: { id },
		});
	} catch {}

	return <CrashDetailsView initialData={initialData} />;
}
