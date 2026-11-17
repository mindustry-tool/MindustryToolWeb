'use client';
import type { PostDto, postQuerySchema, WikiDto } from '@mindustry-tool/api';
import type { ReactNode } from 'react';
import type { z } from 'zod/v4-mini';

import type { WikiNode } from '@/lib/wiki-tree';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createWikiSchema, searchWikiQuery, updateWikiSchema, wikiLinkSchema } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	BookOpen,
	ChevronDown,
	ChevronRight,
	File,
	Folder,
	Link2Off,
	LinkIcon,
	Pencil,
	Plus,
	Trash,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Suspense, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Portal from '@/components/common/portal';
import { SearchInput } from '@/components/common/search-input';
import { PostCard } from '@/components/post/post-card';
import { ApiItem } from '@/components/query/api-item';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { buildTree } from '@/lib/wiki-tree';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/common/page-wrapper';

export default function Page() {
	return (
		<Suspense>
			<PageWrapper>
				<ApiItem route={api.v4.wiki.findAll} queryKey={['wikis']} query={searchWikiQuery} empty={() => 'Not shit here'}>
					{(items) => <Items items={items} />}
				</ApiItem>
			</PageWrapper>
			<Portal parentId="nav-header">
				<WikiSearchBar />
				<Suspense>
					<CreateWikiForm />
				</Suspense>
			</Portal>
		</Suspense>
	);
}

function Items({ items }: { items: WikiDto[] }) {
	const tree = useMemo(() => buildTree(items), [items]);
	const [selected, setSelected] = useState<string>();

	return (
		<div className="rounded-md">
			<WikiTreeItem node={tree} onSelect={setSelected} selectedId={selected} />
		</div>
	);
}

type WikiTreeViewProps = {
	node: WikiNode<WikiDto>;
	onSelect?: (data: string) => void;
	selectedId?: string;
	level?: number;
};

function WikiTreeItem({ node, onSelect, selectedId, level = 0 }: WikiTreeViewProps) {
	const [open, setOpen] = useQueryState('open');

	const parts = open?.split('.');

	const isExpanded = parts && parts[level] && parts[level] === node.segment;
	const children = node.leaves.size;
	const isSelected = selectedId && selectedId === node.data?.id;
	const isRoot = node.segment === 'ROOT';

	if (isRoot) {
		return (
			<div className="space-y-1">
				{Array.from(node.leaves.entries())
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([_, child]) => (
						<WikiTreeItem key={child.segment} node={child} onSelect={onSelect} selectedId={selectedId} level={level} />
					))}
			</div>
		);
	}

	const handleClick = () => {
		if (children > 0) {
			if (isExpanded) {
				const lastDot = node.path.lastIndexOf('.', node.segment.length);

				if (lastDot > 0) {
					setOpen(node.path.substring(0, lastDot));
				} else {
					setOpen(null);
				}
			} else {
				setOpen(node.path ?? null);
			}
		}
	};

	const handleSelect = () => {
		if (node.data?.id) {
			onSelect?.(node.data?.id);
		}
	};

	return (
		<div>
			<div
				className={cn(
					'flex items-center bg-card h-9 text-sm gap-2 px-2 py-1.5 cursor-pointer rounded-md transition-colors mt-1',
					children === 0 && isSelected
						? 'bg-accent text-accent-foreground dark:bg-accent/50'
						: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				)}
				style={{ marginLeft: `${level * 16 + (children > 0 ? 0 : 16)}px` }}
				onClick={handleSelect}
			>
				{children > 0 &&
					(isExpanded ? (
						<ChevronDown className="h-4 w-4 text-muted-foreground" onClick={handleClick} />
					) : (
						<ChevronRight className="h-4 w-4 text-muted-foreground" onClick={handleClick} />
					))}
				{children > 0 ? (
					node.data ? (
						<Folder className="h-4 w-4 text-purple-500" />
					) : (
						<Folder className="h-4 w-4 text-yellow-300" />
					)
				) : (
					<File className="h-4 w-4 text-purple-500" />
				)}
				<span className="truncate">{node.segment}</span>
				{children > 0 && <span className="text-muted-foreground">({children})</span>}
				{children > 0 && (
					<CreateWikiForm path={`${node.path}.`}>
						<Button variant="ghost" size="icon" className="ml-auto">
							<Plus />
						</Button>
					</CreateWikiForm>
				)}
				{isSelected && node.data && (
					<div className="ml-auto flex gap-0.5">
						<Dialog>
							<DialogTrigger asChild>
								<Button className="aspect-square" variant="ghost" size="sm">
									<LinkIcon />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="wiki.link" />
								</DialogTitle>
								<DialogDescription>
									<Tran text="wiki.link-description" />
								</DialogDescription>
								<CreateWikiLinkForm node={node.data} />
							</DialogContent>
						</Dialog>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="aspect-square" variant="ghost" size="sm">
									<Pencil />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="wiki.edit" />
								</DialogTitle>
								<DialogDescription>
									<Tran text="wiki.edit-description" />
								</DialogDescription>
								<EditWikiForm node={node.data} />
							</DialogContent>
						</Dialog>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="aspect-square text-destructive/70 hover:text-destructive" variant="ghost" size="sm">
									<Trash />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogTitle>
									<Tran text="wiki.delete" />
								</AlertDialogTitle>
								<AlertDialogDescription>
									<Tran text="wiki.delete-description" />:{node.data.path}
								</AlertDialogDescription>
								<AlertDialogCancel asChild>
									<Button variant="outline">
										<Tran text="cancel" />
									</Button>
								</AlertDialogCancel>
								<AlertDialogAction asChild>
									<DeleteWikiButton node={node.data} />
								</AlertDialogAction>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>
			{node.data && node.data.posts.length > 0 && (
				<div className="space-y-1 border-l pt-1" style={{ marginLeft: (level + 1) * 16 + 16 + (children > 0 ? 8 : 0) }}>
					{node.data.posts.map((post) => (
						<div
							key={post.id}
							className="ml-1 flex h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
						>
							<Popover>
								<PopoverTrigger asChild>
									<div className="flex items-center gap-2">
										<BookOpen className="h-4 w-4" />
										<Tran text={post.language} />|
										<span className="max-w-sm text-ellipsis underline">{post.title}</span>
									</div>
								</PopoverTrigger>
								<PopoverContent>
									<PostCard data={post} />
								</PopoverContent>
							</Popover>
							<div className="ml-auto flex items-center gap-2">
								<Button
									className="aspect-square text-destructive/70 hover:text-destructive"
									variant="ghost"
									size="sm"
									asChild
								>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												className="aspect-square text-destructive/70 hover:text-destructive"
												variant="ghost"
												size="sm"
											>
												<Link2Off />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogTitle>
												<Tran text="wiki.remove-link" />
											</AlertDialogTitle>
											<AlertDialogDescription>
												<Tran text="wiki.remove-link-description" />
											</AlertDialogDescription>
											<AlertDialogCancel asChild>
												<Button variant="outline">
													<Tran text="cancel" />
												</Button>
											</AlertDialogCancel>
											{node.data && (
												<AlertDialogAction asChild>
													<RemoveWikiLinkButton wikiId={node.data.id} postId={post.id} />
												</AlertDialogAction>
											)}
										</AlertDialogContent>
									</AlertDialog>
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
			{children > 0 && isExpanded && (
				<div className="space-y-1">
					{Array.from(node.leaves.entries())
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([_, child]) => (
							<WikiTreeItem
								key={child.segment}
								node={child}
								onSelect={onSelect}
								selectedId={selectedId}
								level={level + 1}
							/>
						))}
				</div>
			)}
		</div>
	);
}

function CreateWikiForm({ path, children }: { path?: string; children?: ReactNode }) {
	const form = useForm<z.infer<typeof createWikiSchema>>({
		resolver: zodResolver(createWikiSchema),
		defaultValues: {
			path,
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['wiki'],
		mutationFn: (body: z.infer<typeof createWikiSchema>) =>
			apiInstance.request(api.v4.wiki.create, {
				body,
			}),
		onError: (error) => {
			toast.error(<Tran text="wiki.create-fail" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: ['wikis'],
				exact: false,
			});
		},
	});

	const onSubmit = (data: z.infer<typeof createWikiSchema>) => mutate(data);

	return (
		<Dialog>
			<DialogTrigger asChild>
				{children ?? (
					<Button className="ml-auto">
						<Tran text="wiki.create" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="wiki.create" />
				</DialogTitle>
				<DialogDescription>
					<Tran text="wiki.create-description" />
				</DialogDescription>
				<Form {...form}>
					<form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
						<FormError />
						<FormField
							control={form.control}
							name="path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Tran text="wiki.path" />
									</FormLabel>
									<FormControl>
										<Input placeholder="wiki.mindustry.maps" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-2">
							<DialogClose asChild>
								<Button variant="outline" type="button">
									<Tran text="cancel" />
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isPending}>
								<Tran text="submit" />
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function WikiSearchBar() {
	const [path, setPath] = useQueryState('path', {
		defaultValue: '',
	});

	return <SearchInput value={path} onChange={setPath} />;
}

function EditWikiForm({ node }: { node: WikiDto }) {
	const form = useForm<z.infer<typeof updateWikiSchema>>({
		resolver: zodResolver(updateWikiSchema),
		defaultValues: { path: node?.path ?? '' },
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['wiki'],
		mutationFn: (body: z.infer<typeof updateWikiSchema>) =>
			apiInstance.request(api.v4.wiki.update, { params: { id: node.id }, body: { ...body } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wikis'] });
		},
		onError: (error) => {
			toast.error(<Tran text="wiki.update-fail" />, { description: error.message });
		},
	});

	function onSubmit(data: z.infer<typeof updateWikiSchema>) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="path"
					render={({ field }) => (
						<FormItem>
							<FormLabel><Tran text="wiki.path" /></FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline" type="button">
							<Tran text="cancel" />
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending} color="primary">
						<Tran text="update" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function DeleteWikiButton({ node }: { node: WikiDto }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['wiki'],
		mutationFn: () => apiInstance.request(api.v4.wiki.delete, { params: { id: node.id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wikis'] });
		},
		onError: (error) => {
			toast.error(<Tran text="wiki.delete-fail" />, { description: error.message });
		},
	});

	return (
		<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
			<Tran text="delete" />
		</Button>
	);
}

function RemoveWikiLinkButton({ wikiId, postId }: { wikiId: string; postId: string }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['wiki'],
		mutationFn: () => apiInstance.request(api.v4.wiki.removeLink, { params: { wikiId, postId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wikis'] });
		},
		onError: (error) => {
			toast.error(<Tran text="wiki.remove-link-fail" />, {
				description: error.message,
			});
		},
	});

	return (
		<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
			<Tran text="wiki.remove-link" />
		</Button>
	);
}

function CreateWikiLinkForm({ node }: { node: WikiDto }) {
	const form = useForm<z.infer<typeof wikiLinkSchema>>({
		resolver: zodResolver(wikiLinkSchema),
		defaultValues: {
			postId: '',
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['wiki'],
		mutationFn: (body: z.infer<typeof wikiLinkSchema>) =>
			apiInstance.request(api.v4.wiki.linkPost, { params: { id: node.id }, body: { ...body } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['wikis'] });
			form.reset();
		},
		onError: (error) => {
			toast.error(<Tran text="wiki.link-fail" />, { description: error.message });
		},
	});

	function onSubmit(data: z.infer<typeof wikiLinkSchema>) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="postId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="post.id" />
							</FormLabel>
							<FormControl>
								<div className="flex flex-col items-start gap-1">
									<Input {...field} />
									<Tran text="or" />
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="outline">
												<Tran text="post.browse-post" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogTitle>
												<Tran text="post.browse-post" />
											</DialogTitle>
											<DialogDescription></DialogDescription>
											<PostSelector onSelect={(post) => field.onChange(post.id)} />
										</DialogContent>
									</Dialog>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline" type="button">
							<Tran text="cancel" />
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending} color="primary">
						<Tran text="wiki.link" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function PostSelector({ onSelect }: { onSelect: (post: PostDto) => void }) {
	const [queryParam, setQueryParam] = useState<z.infer<typeof postQuerySchema>>({
		page: 0,
		size: 100,
	});

	return (
		<div className="flex flex-col gap-2">
			<SearchInput
				className="max-w-none"
				value={queryParam.name ?? ''}
				onChange={(q) => setQueryParam((prev) => ({ ...prev, q }))}
			/>
			<Suspense>
				<InfiniteApiItem className="grid gap-2" route={api.v4.posts.findAll} queryKey={['posts']} query={queryParam}>
					{(items) => <SelectPostItem items={items} onSelect={onSelect} />}
				</InfiniteApiItem>
			</Suspense>
		</div>
	);
}

function SelectPostItem({ items, onSelect }: { items: PostDto[][]; onSelect: (post: PostDto) => void }) {
	return (
		<div className="flex max-h-dvh flex-col gap-4 overflow-y-auto">
			{items
				.flatMap((p) => p)
				.map((item) => (
					<div className="flex flex-col gap-2 rounded-md border bg-card p-4 shadow-lg" key={item.id}>
						<PostCard data={item} />
						<DialogClose asChild>
							<Button color="primary" onClick={() => onSelect(item)}>
								<Tran text="wiki.link" />
							</Button>
						</DialogClose>
					</div>
				))}
		</div>
	);
}
