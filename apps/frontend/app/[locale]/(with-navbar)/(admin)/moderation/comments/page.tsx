'use client';

import { api } from '@mindustry-tool/api';
import { paginationQuerySchema, type AdminCommentDto } from '@mindustry-tool/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { CommentContent } from '@/components/comment/comment-content';
import { RelativeTime } from '@/components/common/relative-time';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { Separator } from '@/components/ui/separator';
import { UserWithAvatarAndName, UserWithIdComponent } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import ScrollContainer from '@/components/common/scroll-container';
import { PageWrapper } from '@/components/common/page-wrapper';
import ProtectedRoute from '@/components/layout/protected-route';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiInstance } from '@/config/api';
import { LocalLink } from '@/components/common/locale-link';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const COMMENTS_ADMIN_QUERY_KEY = ['comments', 'admin'];

const itemTypeToRoute: Record<string, string> = {
	POST: 'posts',
	SCHEMATIC: 'schematics',
	MAP: 'maps',
	CONTENT_PATCH: 'content-patches',
};

const itemTypeLabels: Record<string, string> = {
	POST: 'Post',
	SCHEMATIC: 'Schematic',
	MAP: 'Map',
	CONTENT_PATCH: 'Content Patch',
};

function TotalCommentsBadge() {
	const { data } = useQuery({
		queryKey: ['count', ...COMMENTS_ADMIN_QUERY_KEY],
		queryFn: () => apiInstance.request(api.v4.comments.countAdmin, {}),
	});

	if (data === undefined) return null;

	return (
		<span className="font-mono text-xs text-muted-foreground border border-border/80 bg-muted/40 px-2 py-0.5 rounded">
			{data.toLocaleString()} comments
		</span>
	);
}

function DeleteCommentButton({ commentId }: { commentId: string }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.comments.delete, {
				params: { id: commentId },
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
			queryClient.invalidateQueries({ queryKey: COMMENTS_ADMIN_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: ['count', ...COMMENTS_ADMIN_QUERY_KEY] });
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
					onClick={(e) => e.stopPropagation()}
				>
					<Tran text="delete" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="delete" />
				</AlertDialogTitle>
				<AlertDialogDescription className="space-y-2 text-sm text-muted-foreground">
					<span>
						<Tran
							text="comment.delete-confirm"
						/>
					</span>
					<span className="block font-mono text-xs text-muted-foreground/80 break-all bg-muted/40 p-2 rounded border border-border/50">
						ID: {commentId}
					</span>
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
							<Tran text="delete" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function CommentRow({ item }: { item: AdminCommentDto }) {
	const routeSegment = itemTypeToRoute[item.itemType] ?? 'posts';
	const itemUrl = `/${routeSegment}/${item.itemId}?commentId=${item.id}`;

	return (
		<div className="rounded-md border border-border/70 bg-card p-3.5 transition-colors hover:border-border">
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
				<div className="flex flex-wrap items-center gap-2">
					<UserWithIdComponent userId={item.userId}>
						<UserWithAvatarAndName className="text-sm font-medium" />
					</UserWithIdComponent>
					<span className="text-muted-foreground/40 select-none">•</span>
					<span className="font-mono text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-border/80 bg-muted/40 text-muted-foreground">
						{itemTypeLabels[item.itemType] ?? item.itemType}
					</span>
					<span className="font-mono text-xs text-muted-foreground/80">
						#{item.itemId.slice(0, 8)}
					</span>
					<span className="text-muted-foreground/40 select-none">•</span>
					<RelativeTime className="text-xs text-muted-foreground" date={new Date(item.createdAt)} />
				</div>

				<div className="flex items-center gap-2">
					<LocalLink
						href={itemUrl}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground"
					>
						View context
					</LocalLink>
					<span className="text-border select-none">|</span>
					<DeleteCommentButton commentId={item.id} />
				</div>
			</div>

			{item.replyId && (
				<div className="mt-2 text-[11px] text-muted-foreground font-mono">
					Replying to comment #{item.replyId.slice(0, 8)}
				</div>
			)}

			<div className="mt-2 text-sm text-foreground/90 max-h-64 overflow-y-auto leading-relaxed">
				<CommentContent content={item.content} />
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<ProtectedRoute filter="comment:manage">
			<PageWrapper>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						<Tran className="text-xl font-semibold tracking-tight" text="moderation.comment" />
						<TotalCommentsBadge />
					</div>
				</div>
				<Separator />
				<ScrollContainer className="space-y-2">
					<Suspense>
						<ApiItem
							queryKey={COMMENTS_ADMIN_QUERY_KEY}
							route={api.v4.comments.findAllAdmin}
							query={paginationQuerySchema}
							loading={() => (
								<div className="space-y-2">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="rounded-md border border-border/60 bg-card p-3.5 space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Skeleton className="h-6 w-6 rounded-full" />
													<Skeleton className="h-4 w-28" />
													<Skeleton className="h-4 w-16" />
												</div>
												<Skeleton className="h-4 w-20" />
											</div>
											<Skeleton className="h-12 w-full" />
										</div>
									))}
								</div>
							)}
						>
							{(items) => (
								<div className="flex flex-col gap-2">
									{items.map((item) => (
										<CommentRow key={item.id} item={item} />
									))}
								</div>
							)}
						</ApiItem>
					</Suspense>
				</ScrollContainer>
				<Separator />
				<Suspense>
					<ApiPagination
						className="mt-auto ml-auto"
						route={api.v4.comments.countAdmin}
						queryKey={COMMENTS_ADMIN_QUERY_KEY}
					/>
				</Suspense>
			</PageWrapper>
		</ProtectedRoute>
	);
}
