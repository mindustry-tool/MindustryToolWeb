'use client';

import type { Locale } from '@mindustry-tool/api';
import type { PostDetailDto } from '@mindustry-tool/api';

import type { z } from 'zod/v4-mini';
import { env } from 'node:process';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createPostSchema } from '@mindustry-tool/api';
import { LOCALES, POST_STATUSES } from '@mindustry-tool/api';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';

import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';

import { Typography } from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import { Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { ChevronLeft, Settings } from 'lucide-react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import * as React from 'react';

// --- Icons ---

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ComboBox from '@/components/combo-box/combo-box';

import { LocalLink } from '@/components/common/locale-link';

import ThemeSwitcher from '@/components/common/theme-switcher';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import { TagIdSelector } from '@/components/tag/tag-id-selector';
import { HorizontalRule } from '@/components/tiptap/nodes/horizontal-rule-node/horizontal-rule-node-extension';
// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap/nodes/image-upload-node/image-upload-node-extension';

import { LinkSyntaxNode } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node';
import { LinkSyntax } from '@/components/tiptap/nodes/link-syntax-node/link-syntax-node-extension';
import { iconSuggestion, userSuggestion } from '@/components/tiptap/nodes/link-syntax-node/suggestion';
// --- UI Primitives ---
import { Spacer } from '@/components/tiptap/ui-primitive/spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap/ui-primitive/toolbar';
import { BlockquoteButton } from '@/components/tiptap/ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap/ui/code-block-button';
import { ColorHighlightPopover } from '@/components/tiptap/ui/color-highlight-popover';
import { ColorHighlighter } from '@/components/tiptap/ui/color-highlighter/color-highlighter';
// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap/ui/heading-dropdown-menu';
import { IconPopover } from '@/components/tiptap/ui/icon-popover';
import { ImageUploadButton } from '@/components/tiptap/ui/image-upload-button';
import { LinkPopover } from '@/components/tiptap/ui/link-popover';

import { ListDropdownMenu } from '@/components/tiptap/ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap/ui/mark-button';
import TableDropdownMenu from '@/components/tiptap/ui/table-dropdown-menu.tsx/table-dropdown-menu';
import { TextAlignButton } from '@/components/tiptap/ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap/ui/undo-redo-button';
import { YoutubeButton } from '@/components/tiptap/ui/youtube-button/youtube-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';
// --- Hooks ---
import { useIsMobile } from '@/hooks/use-mobile';
import { useWarnIfUnsavedChanges } from '@/hooks/use-warn-if-unsaved-changes';
import { useWindowSize } from '@/hooks/use-window-size';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/image-upload';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
	title: '',
	content: '',
	summary: '',
	status: 'PUBLISHED',
	language: 'en',
	tags: [] as string[],
} satisfies z.infer<typeof createPostSchema>;

export default function SimpleEditor({ edit }: { edit?: PostDetailDto }) {
	const [tab, setTab] = useQueryState('tabs', { defaultValue: 'title' });
	const router = useRouter();
	const queryClient = useQueryClient();
	const { t } = useI18n('post');

	const { mutate, isPending } = useMutation({
		mutationFn: (data: z.infer<typeof createPostSchema>) =>
			edit
				? apiInstance.request(api.v4.posts.update, {
						params: { id: edit.itemId ?? edit.id },
						body: data,
					})
				: apiInstance.request(api.v4.posts.create, {
						body: data,
					}),
		onMutate: () => {
			return toast.loading(<Tran text="post.submitting" />);
		},
		onError: (error, _var, id) => {
			toast.error(<Tran text="post.submit-failed" />, {
				description: error.message,
				id,
				dismissible: true,
			});
		},
		onSuccess: (data, _var, id) => {
			form.reset();
			toast.success(<Tran text="post.submit-success" />, {
				id,
			});

			queryClient.invalidateQueries({
				queryKey: ['posts'],
			});

			queryClient.invalidateQueries({
				queryKey: ['wikis'],
			});

			setTimeout(() => {
				if (edit) {
					router.push(`/posts/${edit.itemId ?? edit.id}`);
				} else if (data?.itemId) {
					router.push(`/posts/${data.itemId}`);
				}
			}, 1000);
		},
	});

	const form = useForm<z.infer<typeof createPostSchema>>({
		resolver: zodResolver(createPostSchema),
		defaultValues: edit
			? { ...edit, language: edit.language as Locale, tags: edit?.tags.map((tag) => tag.id) }
			: EMPTY_FORM,
	});

	useWarnIfUnsavedChanges(env.NODE_ENV === 'production' && form.formState.isDirty);

	const onSubmit: (data: z.infer<typeof createPostSchema>) => void = React.useCallback(
		(data) => mutate(data),
		[mutate],
	);

	const onContentUpdate = React.useCallback((content: string) => form.setValue('content', content), [form]);

	return (
		<Tabs className="h-full" value={tab} onValueChange={setTab} defaultValue={tab}>
			<EditorTabBar>
				<div>
					<Button variant="ghost" asChild>
						<LocalLink href={routes.posts.value}>
							<ChevronLeft />
							<Tran text="back" />
						</LocalLink>
					</Button>
				</div>
				<TabsList className="mx-auto grid grid-cols-2 gap-1">
					<TabsTrigger value="title" type="button">
						Title
					</TabsTrigger>
					<TabsTrigger
						className={cn({
							'border border-destructive': form.formState.errors.content,
						})}
						value="content"
						type="button"
					>
						Content
					</TabsTrigger>
				</TabsList>
				<div className="ml-auto">
					<Button variant="ghost" size="icon" type="submit" disabled>
						<Settings />
					</Button>
				</div>
			</EditorTabBar>
			<TabsContent className="mx-auto h-full w-full space-y-6 overflow-hidden px-4 pb-4" value="title">
				<React.Suspense>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="h-full w-full space-y-8 overflow-x-hidden overflow-y-auto"
						>
							<FormError />
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="post.title" />
										</FormLabel>
										<FormControl>
											<Input placeholder={t('title-placeholder')} {...field} autoComplete="off" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="summary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="post.summary" />
										</FormLabel>
										<FormControl>
											<Textarea {...field} autoComplete="off" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="cover"
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel>
											<Tran text="post.cover" />
										</FormLabel>
										<FormControl>
											<div className="flex items-center gap-2">
												<Dialog>
													<DialogTrigger asChild>
														<Button className="w-fit justify-start" variant="outline" type="button">
															<Tran text="post.select-cover" />
														</Button>
													</DialogTrigger>
													<DialogContent className="w-fit min-w-0 p-0" showCloseButton={false}>
														<VisuallyHidden>
															<DialogTitle></DialogTitle>
															<DialogDescription></DialogDescription>
														</VisuallyHidden>
														<ImageSelectForm
															{...field}
															onChange={(image) => field.onChange(image ? image.url : null)}
															fieldState={fieldState}
															width={256}
															height={256}
														/>
													</DialogContent>
												</Dialog>
												{field.value && (
													<NextImage
														className="aspect-square size-9 rounded-md object-cover object-center"
														src={field.value}
														alt={t('cover-alt')}
														width={36}
														height={36}
													/>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="language"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="post.language" />
										</FormLabel>
										<FormControl>
											<ComboBox<Locale>
												required
												values={LOCALES as unknown as Locale[]}
												value={field.value as Locale}
												onChange={field.onChange}
												render={(locale) => <Tran text={locale} />}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="tags" />
										</FormLabel>
										<FormControl>
											<TagIdSelector returnType="id" value={field.value} onValueChange={field.onChange} type="posts" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="post.status" />
										</FormLabel>
										<FormControl>
											<ComboBox
												values={POST_STATUSES}
												value={field.value}
												onChange={field.onChange}
												render={(status) => (
													<Tran
														text={`post.status-${status}` as Lowercase<string>}
													/>
												)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isPending || !form.formState.isDirty}>
								<Tran text="submit" />
							</Button>
						</form>
					</Form>
				</React.Suspense>
			</TabsContent>
			<TabsContent className="overflow-hidden" value="content">
				<React.Suspense>
					<ContentEditor content={form.watch('content')} onUpdate={onContentUpdate} />
				</React.Suspense>
			</TabsContent>
		</Tabs>
	);
}

export function EditorTabBar({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('grid grid-cols-3 px-2 mx-auto mt-2 w-full', className)} {...props}>
			{children}
		</div>
	);
}

type ContentEditorProps = {
	content: string;
	onUpdate: (content: string) => void;
};

function ContentEditor({ content, onUpdate }: ContentEditorProps) {
	const isMobile = useIsMobile();
	const { height } = useWindowSize();

	const toolbarRef = React.useRef<HTMLDivElement>(null);

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
			TableKit.configure({
				table: {
					resizable: true,
				},
			}),
			Youtube.configure({
				inline: false,
			}),
		],
		content: content ? JSON.parse(content) : '',
		onUpdate: (event) => {
			onUpdate(JSON.stringify(event.editor.getJSON()));
		},
	});

	const rect = useCursorVisibility({
		editor,
		// eslint-disable-next-line react-hooks/refs
		overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
	});

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			<EditorContext value={{ editor }}>
				<Toolbar
					ref={toolbarRef}
					style={{
						...(isMobile
							? {
									bottom: `calc(100% - ${height - rect.y}px)`,
								}
							: {}),
					}}
				>
					<div className="flex w-full gap-1">
						<MainToolbarContent />
					</div>
				</Toolbar>
				<div className="h-full overflow-y-auto px-2">
					<EditorContent
						editor={editor}
						role="presentation"
						className="mx-auto prose h-full prose-neutral dark:prose-invert"
					/>
				</div>
			</EditorContext>
		</div>
	);
}
// In the MainToolbarContent component, add the YouTube button:
const MainToolbarContent = () => {
	return (
		<>
			<Spacer />
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
				<TableDropdownMenu />
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
				<IconPopover />
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
				<YoutubeButton text="YouTube" />
			</ToolbarGroup>
			<Spacer />
			<ToolbarGroup>
				<ThemeSwitcher />
			</ToolbarGroup>
		</>
	);
};
