import { TableOfContent } from '@/app/[locale]/wiki/[postId]/components/table-of-content';
import { PostViewTrigger } from '@/components/post/post-view-trigger';
import { ReactNode } from 'react';

export default async function Layout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<div className="grid grid-cols-[1fr_auto_1fr] gap-2 overflow-hidden px-4 xl:grid-cols-[1fr_90ch_1fr]">
			<div></div>
			<div id="content" className="mt-2 flex h-full w-full flex-col space-y-10 overflow-y-auto">
				<PostViewTrigger postId={id} />
				{children}
			</div>
			<TableOfContent />
		</div>
	);
}
