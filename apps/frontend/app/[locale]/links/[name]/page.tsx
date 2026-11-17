import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import environment from '@/config/environment';

const links: Record<string, { href: string; title: string; description: string }> = {
	'mindustry-vietnam': {
		href: environment.url.vnDiscordServer,
		title: 'Discord MindustryTool Việt Nam',
		description: 'Tham gia vào máy chủ của Mindustry Việt Nam',
	},
	'mindustry-tool': {
		href: environment.url.discordServer,
		title: 'Mindustry Tool',
		description:
			'Join our active Mindustry community to connect with fellow players, share experiences, get support, and collaborate on exciting development projects. Let’s grow together!',
	},
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
	const { name } = await params;

	const item = links[name];

	if (!item) {
		return {};
	}

	const { title, description } = item;

	return {
		title: formatTitle(title),
		description,
		openGraph: {
			title: formatTitle(title),
			description,
		},
		alternates: generateAlternate(`/links/${name}`),
	};
}

export function generateStaticParams() {
	return Object.keys(links).map((name) => ({ name }));
}

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
	const { name } = await params;

	const item = links[name];

	if (!item) {
		return (
			<div className="flex flex-col gap-2">
				{Object.entries(links).map(([key, value]) => (
					<a className='text-primary' key={key} href={value.href} target="_blank" rel="noopener noreferrer">
						{value.title}
					</a>
				))}
			</div>
		);
	}

	redirect(item.href);
}
