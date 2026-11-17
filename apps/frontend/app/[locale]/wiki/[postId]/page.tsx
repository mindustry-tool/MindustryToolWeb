import type { Locale } from '@mindustry-tool/api';
import type { Metadata } from 'next';

import { api } from '@mindustry-tool/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cache, Suspense } from 'react';

import { getWikiList } from '@/app/[locale]/wiki/components/wiki.action';
import { LocalLink } from '@/components/common/locale-link';
import ErrorMessage from '@/components/error/error-message';
import { Container } from '@/components/layout/container';
import { TagContainer } from '@/components/tag/tag-container';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { throwNotFound } from '@/lib/error.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { renderPost } from '@/lib/post.utils';
import { formatTitle } from '@/lib/string.utils';
import { LocaleDate } from '@/components/common/locale-date';

type Props = {
	params: Promise<{ postId: string; locale: string }>;
};

const getPostById = cache(
	async (id: string) =>
		await apiInstance.tryRequest(api.v4.posts.getById, {
			params: { id },
			timeout: 5000,
		}),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { postId } = await params;

	const [data, error] = await getPostById(postId);

	if (error) {
		return {
			title: String(error),
		};
	}

	const { title, summary, cover } = data;

	return {
		title: formatTitle(title),
		description: summary,
		openGraph: {
			title: formatTitle(title),
			description: summary,
			images: cover ? [cover] : [],
		},
		twitter: {
			title: formatTitle(title),
			description: summary,
			images: cover ? [cover] : [],
		},
		alternates: generateAlternate(`/wiki/${postId}`),
	};
}

export default async function Page({ params }: Props) {
	const { postId, locale } = await params;

	const [data, error] = await getPostById(postId);

	throwNotFound(error);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	const { title, content, createdAt, tags } = data;

	const html = renderPost(content, []);

	return (
		<Container id="content" className="mx-auto w-full max-w-[90ch] xl:w-[90ch]">
			<div className="mt-2 w-full space-y-10">
				<header className="flex flex-col">
					<h1 className="mb-2 text-6xl">{title}</h1>
					<span className="text-xs text-muted-foreground">
						<Suspense>
							<LocaleDate date={createdAt} />
						</Suspense>
					</span>
				</header>
				{tags.length > 0 && <TagContainer tags={tags} />}
				<main className="prose prose-neutral dark:prose-invert">{html}</main>
				<Suspense>
					<PreviousNext postId={postId} language={locale as Locale} />
				</Suspense>
			</div>
		</Container>
	);
}

async function PreviousNext({ postId, language }: { postId: string; language: Locale }) {
	const [data, error] = await getWikiList(language);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	const currentIndex = data.findIndex((wiki) => wiki.post.id === postId);
	const previousWiki = data[currentIndex - 1];
	const nextWiki = data[currentIndex + 1];

	const previous = previousWiki?.post;
	const next = nextWiki?.post;

	return (
		<div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
			{previous ? (
				<Button asChild variant="outline">
					<LocalLink
						className="h-auto flex-col items-start justify-center"
						href={routes.wiki.postId({ id: previous.id, path: previousWiki.path })}
					>
						<span className="flex items-center">
							<ChevronLeft className="size-4.5" />
							<span>{previous.title}</span>
						</span>
						<span className="ml-1 w-full overflow-hidden text-ellipsis text-muted-foreground">{previous.summary}</span>
					</LocalLink>
				</Button>
			) : (
				<div />
			)}
			{next ? (
				<Button asChild variant="outline">
					<LocalLink
						className="h-auto flex-col items-end justify-center"
						href={routes.wiki.postId({ id: next.id, path: nextWiki.path })}
					>
						<span className="flex items-center">
							<span>{next.title}</span>
							<ChevronRight className="size-4.5" />
						</span>
						<span className="mr-1 w-full overflow-hidden text-right text-ellipsis text-muted-foreground">
							{next.summary}
						</span>
					</LocalLink>
				</Button>
			) : (
				<div />
			)}
		</div>
	);
}
