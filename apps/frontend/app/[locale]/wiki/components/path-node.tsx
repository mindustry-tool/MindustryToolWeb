'use client';

import type { WikiViewDto } from '@mindustry-tool/api';
import type { ReactNode } from 'react';
import type { WikiNode } from '@/lib/wiki-tree';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { LocalLink } from '@/components/common/locale-link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';

function BranchNode({ node, level }: { level: number; node: WikiNode<WikiViewDto> }) {
	const searchParams = useSearchParams();
	const isRoot = level === 1;
	const path = String(searchParams.get('path'));
	const isActive = path.startsWith(node.path);

	const [value, setValue] = useState(isRoot || isActive ? node.segment : undefined);

	return (
		<Accordion
			value={value}
			onValueChange={setValue}
			className={cn('flex flex-col w-full', {
				'text-sm': level > 1,
			})}
			type="single"
			collapsible
		>
			<AccordionItem className="w-full" value={node.segment}>
				<div className="flex items-center justify-between gap-2 rounded-lg pr-2 hover:bg-muted hover:text-foreground">
					<AccordionTrigger className={cn('p-0 w-full items-center', { 'text-sm': level > 1 })}>
						{node.data ? (
							<Suspense>
								<PostLink postId={node.data.post.id} path={node.path}>
									{node.data.post.title}
								</PostLink>
							</Suspense>
						) : (
							<span className="p-2 text-ellipsis capitalize">{node.segment}</span>
						)}
					</AccordionTrigger>
				</div>
				<AccordionContent className="flex w-full flex-col p-0" style={{ marginLeft: level * 8 }}>
					{Array.from(node.leaves.entries()).map(([segment, child]) => (
						<TreeNode key={segment} node={child} level={level + 1} />
					))}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

export function TreeNode({ node, level }: { level: number; node: WikiNode<WikiViewDto> }) {
	const hasChild = node.leaves.size > 0;

	if (hasChild) {
		return <BranchNode node={node} level={level} />;
	}

	return (
		<div className="flex w-full items-center justify-between underline">
			{node.data ? (
				<Suspense>
					<PostLink path={node.path} postId={node.data.post.id}>
						{node.data.post.title}
					</PostLink>
				</Suspense>
			) : (
				<span className="p-2 text-ellipsis capitalize">{node.segment}</span>
			)}
		</div>
	);
}

export function PostLink({ postId, path, children }: { postId: string; path: string; children: ReactNode }) {
	const params = useParams();

	return (
		<LocalLink
			className={cn('underline text-ellipsis hover:bg-muted hover:text-primary rounded-lg w-full p-2', {
				'text-primary': postId === params.postId,
			})}
			href={routes.wiki.postId({ id: postId, path })}
		>
			{children}
		</LocalLink>
	);
}
