'use client';

import { api } from '@mindustry-tool/api';
import { postQuerySchema } from '@mindustry-tool/api';

import { Skeletons } from '@/components/common/skeletons';
import { PostCard, PostCardSkeleton } from '@/components/post/post-card';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';

const POSTS_QUERY_KEY = ['posts'];

export function Posts() {
	return (
		<InfiniteApiItem
			className="grid w-full gap-4 lg:grid-cols-2 2xl:grid-cols-3"
			route={api.v4.posts.findAll}
			queryKey={POSTS_QUERY_KEY}
			query={postQuerySchema}
			loading={() => (
				<Skeletons>
					<PostCardSkeleton />
				</Skeletons>
			)}
		>
			{(pages) => pages.flatMap((page) => page).map((post) => <PostCard key={post.id} data={post} />)}
		</InfiniteApiItem>
	);
}
