import type { Metadata } from 'next';
import { api } from '@mindustry-tool/api';
import { Ellipsis, Eye, FlagIcon, MessageCircle, Pencil, Trash } from 'lucide-react';

import dynamic from 'next/dynamic';
import { cache, Suspense } from 'react';

import DeletePostDialog from '@/app/[locale]/(with-navbar)/(everyone)/posts/[id]/components/delete-post-dialog';

import { LikeButton } from '@/components/buttons/like-button';
import { LocalLink } from '@/components/common/locale-link';
import ErrorMessage from '@/components/error/error-message';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { TagContainer } from '@/components/tag/tag-container';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { throwNotFound } from '@/lib/error.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { renderPost } from '@/lib/post.utils';
import { formatTitle } from '@/lib/string.utils';
import { LocaleDate } from '@/components/common/locale-date';

const CommentSection = dynamic(() => import('@/components/comment/comment-section'));

type Props = {
	params: Promise<{
		id: string;
	}>;
};

const getPostById = cache(
	async (id: string) =>
		await apiInstance.tryRequest(api.v4.posts.getById, {
			params: { id },
			timeout: 5000,
		}),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	const [data, error] = await getPostById(id);

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
		alternates: generateAlternate(`/posts/${id}`),
	};
}

export default async function Page({ params }: Props) {
	const { id } = await params;

	return <Content postId={id} />;
}

async function Content({ postId }: { postId: string }) {
	const [data, error] = await getPostById(postId);

	throwNotFound(error);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	const { itemId, title, content, createdAt, createdBy, comments, views, tags } = data;

	return (
		<>
			<header className="flex justify-between gap-4">
				<section className="space-y-4">
					<h1 className="text-6xl">{title}</h1>
					<UserWithIdComponent userId={createdBy}>
						<div className="flex h-13 items-end gap-1">
							<UserAvatar size={48} />
							<div className="grid gap-1">
								<UserName className="text-lg" />
								<div className="text-sm text-muted-foreground">
									<LocaleDate date={createdAt} />
								</div>
							</div>
						</div>
					</UserWithIdComponent>
					{tags.length > 0 && <TagContainer tags={tags} />}
					<div className="flex items-center gap-1 text-muted-foreground">
						<Button variant="ghost">
							<MessageCircle className="size-5" />
							{comments}
						</Button>
						<Button variant="ghost">
							<Eye className="size-5" />
							{views}
						</Button>
						<LikeButton itemType="posts" data={data} />
					</div>
				</section>
				<PostEllipsis data={{ id: postId, createdBy }} />
			</header>
			<div className="prose prose-neutral dark:prose-invert">{renderPost(content, [])}</div>
			<CommentSection itemType="posts" itemId={itemId} />
		</>
	);
}

function PostEllipsis({ data: { id, createdBy } }: { data: { id: string; createdBy: string } }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost">
					<Ellipsis size={20} />
				</Button>
			</DropdownMenuTrigger>
			<Suspense>
				<AlertDialog>
					<DropdownMenuContent className="w-56" align="start">
						<DropdownMenuGroup>
							<DropdownMenuItem variant="destructive">
								<Tran text="post.report" />
								<FlagIcon className="ml-auto" size={16} />
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<ClientProtectedElement filter={{ authorId: createdBy }}>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<LocalLink href={`${routes.newPost}?edit=${id}`}>
										<Tran text="post.edit" />
										<Pencil className="ml-auto" size={16} />
									</LocalLink>
								</DropdownMenuItem>
								<AlertDialogTrigger asChild>
									<DropdownMenuItem variant="destructive">
										<Tran text="delete" />
										<Trash className="ml-auto" />
									</DropdownMenuItem>
								</AlertDialogTrigger>
							</DropdownMenuGroup>
						</ClientProtectedElement>
					</DropdownMenuContent>
					<AlertDialogContent>
						<DeletePostDialog postId={id} />
					</AlertDialogContent>
				</AlertDialog>
			</Suspense>
		</DropdownMenu>
	);
}
