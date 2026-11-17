'use client';

import type { CommentDto } from '@mindustry-tool/api';
import type { InfiniteData } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { DEFAULT_PAGINATION_SIZE } from '@mindustry-tool/api';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { Placeholder, Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ChevronDown, MoreHorizontal, Reply, Send, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { hasAccess } from '@mindustry-tool/api';
import { useSession } from '@/hooks/use-session';
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
import { CommentContent } from '@/components/comment/comment-content';
import { RelativeTime } from '@/components/common/relative-time';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { ImageUploadNode } from '@/components/tiptap/nodes/image-upload-node';
import { LinkSyntaxNode } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node';
import { LinkSyntax } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node-extension';
import { iconSuggestion, userSuggestion } from '@/components/tiptap/nodes/link-syntax-node/suggestion';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap/ui-primitive/toolbar';
import { BlockquoteButton } from '@/components/tiptap/ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap/ui/code-block-button';
import { ColorHighlightPopover } from '@/components/tiptap/ui/color-highlight-popover';
import { ColorHighlighter } from '@/components/tiptap/ui/color-highlighter/color-highlighter';
import { HeadingDropdownMenu } from '@/components/tiptap/ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap/ui/image-upload-button';
import { LinkPopover } from '@/components/tiptap/ui/link-popover';
import { ListDropdownMenu } from '@/components/tiptap/ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap/ui/mark-button';
import { TextAlignButton } from '@/components/tiptap/ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap/ui/undo-redo-button';
import { Button } from '@/components/ui/button';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/image-upload';
import LoginButton from '@/components/buttons/login-button';
import ClientProtectedElement from '@/components/layout/client-protected-element';

type CommentSectionProps = {
	itemType: string;
	itemId: string;
};

function CommentCard({
	comment,
	itemId,
	itemType,
	isHighlighted,
}: {
	comment: CommentDto;
	itemType: string;
	itemId: string;
	isHighlighted?: boolean;
}) {
	const [replyingTo, setReplyingTo] = useState<CommentDto>();
	const queryClient = useQueryClient();
	const { session } = useSession();
	const canDelete = session && (hasAccess(session, 'god') || hasAccess(session, 'comment:manage'));

	const { mutate: deleteComment, isPending: isDeleting } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.comments.delete, {
				params: { id: comment.id },
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
			queryClient.invalidateQueries({ queryKey: ['comments', itemId, itemType] });
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
	});

	return (
		<div
			className={cn(
				'group rounded-lg transition-all duration-300',
				isHighlighted && 'ring-2 ring-primary/60 bg-primary/5 p-2.5',
			)}
			id={comment.id}
		>
			<UserWithIdComponent userId={comment.userId}>
				<div className="flex w-full gap-2">
					<UserAvatar size={36} />
					<div className="flex w-full flex-col gap-1 overflow-hidden">
						<div className="flex min-h-9 w-full items-center gap-2">
							<UserName />
							<RelativeTime className="text-xs text-muted-foreground" date={new Date(comment.createdAt)} />
							{comment.replyId && <ReplyMessage replyId={comment.replyId} itemId={itemId} itemType={itemType} />}
							<Button className="ml-auto md:hidden md:group-hover:inline-flex" size="icon" variant="ghost">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
						<div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
							<CommentContent content={comment.content} />
						</div>
						<div className="flex items-center space-x-2">
							<Button
								className="h-7 text-xs text-muted-foreground"
								variant="none"
								size="none"
								onClick={() => setReplyingTo(comment)}
							>
								<Reply className="mr-1 h-3 w-3" />
								<Tran text="comment.reply" />
							</Button>
							{canDelete && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											className="h-7 text-xs text-muted-foreground hover:text-destructive"
											variant="none"
											size="none"
										>
											<Trash2 className="mr-1 h-3 w-3" />
											<Tran text="delete" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogTitle>
											<Tran text="delete" />
										</AlertDialogTitle>
										<AlertDialogDescription>
											<Tran text="comment.delete-confirm" />
										</AlertDialogDescription>
										<AlertDialogFooter>
											<AlertDialogCancel>
												<Tran text="cancel" />
											</AlertDialogCancel>
											<AlertDialogAction asChild>
												<Button variant="destructive" onClick={() => deleteComment()} disabled={isDeleting}>
													<Tran text="delete" />
												</Button>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
						{replyingTo && (
							<CommentInput
								itemId={itemId}
								itemType={itemType}
								replyingTo={replyingTo}
								onCancel={() => setReplyingTo(undefined)}
								onSuccess={() => {
									setReplyingTo(undefined);
									// Invalidate the root query; children are derived from the same list
									queryClient.invalidateQueries({
										queryKey: ['comments', itemId, itemType],
									});
								}}
							/>
						)}
					</div>
				</div>
			</UserWithIdComponent>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="py-4 text-center">
			<p className="text-sm text-muted-foreground">
				<Tran text="comment.no-comment" />
			</p>
		</div>
	);
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div className="mt-8 space-y-12">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-start space-x-3">
					<div className="h-8 w-8 rounded-full bg-muted" />
					<div className="flex-1 space-y-2">
						<div className="h-4 w-1/4 rounded bg-muted" />
						<div className="h-3 w-full rounded bg-muted" />
						<div className="h-3 w-3/4 rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}

export default function CommentSection({ itemId, itemType }: CommentSectionProps) {
	const searchParams = useSearchParams();
	const targetCommentId = searchParams?.get('commentId');

	const { data, isError, error, isLoading, hasNextPage, isFetching, fetchNextPage } = useComments({
		itemId,
		itemType,
	});

	const queryClient = useQueryClient();

	const allComments = data?.pages.flatMap((page) => page) || [];

	useEffect(() => {
		if (!targetCommentId || isLoading) return;
		const el = document.getElementById(targetCommentId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [targetCommentId, isLoading, allComments.length]);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<div id="comment-section" className="relative flex w-full flex-col gap-4 pb-4">
			<div className="mt-8 border-t" />
			<CommentInput
				itemId={itemId}
				itemType={itemType}
				onSuccess={() =>
					queryClient.invalidateQueries({
						queryKey: ['comments', itemId, itemType],
					})
				}
				onCancel={() => {}}
			/>
			{isLoading ? (
				<LoadingSkeleton count={3} />
			) : allComments.length === 0 ? (
				<EmptyState />
			) : (
				allComments.map((comment) => (
					<CommentCard
						key={comment.id}
						itemId={itemId}
						comment={comment}
						itemType={itemType}
						isHighlighted={targetCommentId === comment.id}
					/>
				))
			)}
			{hasNextPage && (
				<div className="flex justify-center pt-4">
					{isFetching ? (
						<LoadingSpinner />
					) : (
						<Button variant="outline" onClick={() => fetchNextPage()} className="min-w-32">
							<ChevronDown className="mr-2 h-4 w-4" />
							<Tran text="comment.load-more" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

function CommentInput({
	replyingTo,
	itemId,
	itemType,
	onSuccess,
	onCancel,
}: {
	replyingTo?: CommentDto;
	onSuccess: () => void;
	onCancel: () => void;
	itemType: string;
	itemId: string;
}) {
	const [content, setContent] = useState('');

	const editor = useEditor({
		immediatelyRender: false,
		shouldRerenderOnTransaction: false,
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				'aria-label': 'Main content area, start typing to enter text.',
				class: 'h-full',
			},
		},
		extensions: [
			StarterKit.configure({
				horizontalRule: false,
				link: {
					openOnClick: false,
					enableClickSelection: true,
				},
			}),
			HorizontalRule,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image.configure({
				inline: true,
				HTMLAttributes: {
					class: 'resizable rounded-md',
				},
			}),
			Typography,
			Superscript,
			Subscript,
			Selection,
			ImageUploadNode.configure({
				accept: 'image/*',
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) =>
					toast.error(<Tran text="image.upload-fail" />, {
						description: error.message,
					}),
			}),
			ColorHighlighter,
			LinkSyntax.extend({
				addNodeView() {
					return ReactNodeViewRenderer(LinkSyntaxNode);
				},
			}).configure({
				suggestions: [userSuggestion, iconSuggestion],
			}),
			Placeholder.configure({
				placeholder: 'Write something',
			}),
		],
		content: content ? JSON.parse(content) : '',
		onUpdate: (event) => {
			setContent(JSON.stringify(event.editor.getJSON()));
		},
	});

	const { mutate, isPending } = useMutation({
		mutationKey: [replyingTo],
		mutationFn: () =>
			apiInstance.request(api.v4.comments.create, {
				body: {
					content,
					itemId,
					replyId: replyingTo?.id ?? null,
				},
				params: {
					itemType,
					itemId,
				},
			}),
		onSuccess: () => {
			setContent('');
			onSuccess();
            editor?.commands.clearContent();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<EditorContext value={{ editor }}>
			<div className="relative bottom-2 mt-2 flex min-h-64 flex-col rounded-lg border bg-card shadow-lg">
				<Toolbar>
					<div className="flex w-full items-center gap-1">
						{replyingTo && (
							<>
								<span className="flex items-center gap-2">
									<Reply className="size-5" />
									<UserWithIdComponent userId={replyingTo.userId}>
										<span className="text-sm text-primary">
											@
											<UserName useColor={false} />
										</span>
									</UserWithIdComponent>
									<Button variant="ghost" size="icon" onClick={onCancel}>
										<X />
									</Button>
								</span>
								<ToolbarSeparator />
							</>
						)}
						<ToolbarGroup>
							<UndoRedoButton action="undo" />
							<UndoRedoButton action="redo" />
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToolbarGroup>
							<HeadingDropdownMenu levels={[1, 2, 3, 4]} />
							<ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
							<BlockquoteButton />
							<CodeBlockButton />
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToolbarGroup>
							<MarkButton type="bold" />
							<MarkButton type="italic" />
							<MarkButton type="strike" />
							<MarkButton type="code" />
							<MarkButton type="underline" />
							<ColorHighlightPopover />
							<LinkPopover />
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToolbarGroup>
							<MarkButton type="superscript" />
							<MarkButton type="subscript" />
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToolbarGroup>
							<TextAlignButton align="left" />
							<TextAlignButton align="center" />
							<TextAlignButton align="right" />
							<TextAlignButton align="justify" />
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToolbarGroup>
							<ImageUploadButton text="Add" />
						</ToolbarGroup>
					</div>
				</Toolbar>
				<div className="h-full flex flex-1 flex-col overflow-y-auto px-2 max-h-[50dvh]">
					<EditorContent
						editor={editor}
						role="presentation"
						className="prose w-full prose-neutral dark:prose-invert"
					/>
				</div>
				<div className="absolute right-2 bottom-2">
					<ClientProtectedElement alt={<LoginButton />}>
						<Button onClick={() => mutate()} disabled={isPending}>
							<Send />
							<Tran text="comment.send" />
						</Button>
					</ClientProtectedElement>
				</div>
			</div>
		</EditorContext>
	);
}

function useComments({ itemId, itemType }: CommentSectionProps) {
	return useInfiniteQuery({
		queryKey: ['comments', itemId, itemType],
		initialPageParam: {
			page: 0,
		},
		getNextPageParam: (lastPage: CommentDto[], allPages: CommentDto[][], lastPageParams: { page: number }) => {
			if (lastPage.length === 0 || lastPage.length < DEFAULT_PAGINATION_SIZE) {
				return undefined;
			}

			return { ...lastPageParams, page: allPages.length };
		},
		queryFn: ({ pageParam }) => {
			return apiInstance.request(api.v4.comments.findAll, {
				params: {
					itemType,
					itemId,
				},
				query: {
					page: pageParam.page,
					size: DEFAULT_PAGINATION_SIZE,
				},
			});
		},
	});
}

function ReplyMessage({ replyId, itemId, itemType }: { replyId: string; itemId: string; itemType: string }) {
	const queryClient = useQueryClient();
	const messages = queryClient.getQueryData<InfiniteData<CommentDto[]>>(['comment', itemId, itemType]);

	if (!messages) {
		return undefined;
	}

	const repliedMessage = messages.pages.flatMap((page) => page).find((item) => item.id === replyId);

	if (!repliedMessage) {
		return undefined;
	}

	return (
		<Link className="flex items-center gap-1" href={`#${repliedMessage.id}`}>
			<Reply className="size-5" />
			<UserWithIdComponent clickable={false} userId={repliedMessage.userId}>
				<span className="text-sm text-primary">
					@
					<UserName useColor={false} />
				</span>
			</UserWithIdComponent>
		</Link>
	);
}
