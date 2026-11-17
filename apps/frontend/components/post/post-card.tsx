import type { PostDto } from '@mindustry-tool/api';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { LocalLink } from '@/components/common/locale-link';
import { RelativeTime } from '@/components/common/relative-time';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { routes } from '@/config/routes';

export function PostCardSkeleton() {
	return <Skeleton className="h-48 w-full" />;
}

export function PostCard({
	data,
}: {
	data: Pick<
		PostDto,
		'itemId' | 'title' | 'summary' | 'createdAt' | 'createdBy' | 'cover' | 'comments' | 'likes' | 'views' 
	> &
		Partial<Pick<PostDto, 'itemId' | 'tags'>>;
}) {
	const { itemId, title, summary, createdAt, createdBy, cover, comments, views, likes } = data;

	return (
		<article className="gradient:liquid-glass relative flex h-48 w-full animate-in items-start justify-between gap-2 rounded-2xl border border-border bg-card p-4 backdrop-blur-xl fade-in gradient:bg-none shadow-lg">
			<LocalLink className="absolute inset-0" href={routes.posts.id({ id: itemId })} aria-label="Go to post"></LocalLink>
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold">{title}</h2>
				{summary && <p className="line-clamp-3 text-sm text-ellipsis text-muted-foreground">{summary}</p>}
				<UserWithIdComponent userId={createdBy}>
					<div className="relative z-10 flex items-center gap-2">
						<UserAvatar />
						<div className="flex flex-col justify-center text-sm text-muted-foreground">
							<UserName />
							<RelativeTime date={new Date(createdAt)} />
						</div>
					</div>
				</UserWithIdComponent>
				<div className="relative z-10 flex items-center gap-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<MessageCircle size={14} />
						{comments}
					</span>
					<span className="flex items-center gap-1">
						<Heart size={15} />
						{likes}
					</span>
					<span className="flex items-center gap-1">
						<Eye size={16} />
						{views}
					</span>
				</div>
			</div>
			{cover && (
				<Image className="aspect-square rounded-md object-cover" src={cover} alt={title} width={96} height={96} />
			)}
		</article>
	);
}
