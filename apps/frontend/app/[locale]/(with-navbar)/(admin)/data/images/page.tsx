'use client';
import type { ApiBody } from '@mindustry-tool/api';
import type { ImageDto } from '@mindustry-tool/api';

import type { z } from 'zod/v4-mini';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createImageFolderSchema, imageQuerySchema, updateImageFolderSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder, Pencil, Plus, Trash, X } from 'lucide-react';
import NextImage from 'next/image';
import { useQueryState } from 'nuqs';

import { Fragment, Suspense, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MutateButton } from '@/components/buttons/mutate-button';
import { SearchInput } from '@/components/common/search-input';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';

export default function Page() {
	return (
		<Suspense>
			<Content />
		</Suspense>
	);
}
function Content() {
	const [path, setPath] = useState<{ name: string; id: string }[]>([]);
	const parentId = path[path.length - 1]?.id || null;

	const setParentId = useCallback(
		(data: { id: string; name: string }) => {
			const index = path.findIndex((item) => item.id === data.id);
			if (index === -1) {
				setPath((prev) => [...prev, data]);
			} else {
				setPath((prev) => [...prev.slice(0, index), data]);
			}
		},
		[path],
	);

	const [isDeleting, setDeleting] = useState(false);
	const [deletes, setDeletes] = useState<string[]>([]);

	const [isUpdating, setUpdating] = useState(false);
	const [update, setUpdate] = useState<ImageDto | null>(null);

	const copyToClipboard = useCallback((data: string) => {
		navigator.clipboard
			.writeText(data)
			.then(() => {
				toast.info(<Tran text="copied" />, {
					description: data,
					descriptionClassName: 'text-ellipsis',
				});
			})
			.catch((error) =>
				toast.error(<Tran text="error" />, {
					description: error.message,
				}),
			);
	}, []);

	const handleSelect = useCallback((id: string) => {
		setDeletes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	}, []);

	return (
		<PageWrapper>
			<div className="flex flex-wrap gap-2">
				<IconSearchBar />
				{isUpdating ? (
					<Button
						variant="secondary"
						onClick={() => {
							setUpdating(false);
							setUpdate(null);
						}}
					>
						<X />
						<Tran text="cancel" />
					</Button>
				) : isDeleting ? (
					<>
						<Button
							variant="secondary"
							onClick={() => {
								setDeleting(false);
								setDeletes([]);
							}}
						>
							<X />
							<Tran text="cancel" />
						</Button>
						<MutateButton
							variant="destructive"
							mutationKey={['images']}
							queryKey={['images']}
							mutationFn={async () => {
								setDeletes([]);
								setDeleting(false);

								for (const id of deletes) {
									await apiInstance.request(api.v4.images.delete, {
										params: { id },
									});
								}
							}}
						>
							<Trash />
							<Tran text="image.delete" />
						</MutateButton>
					</>
				) : (
					<>
						<Dialog>
							<DialogTrigger asChild>
								<Button>
									<Plus />
									<Tran text="image.create" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="image.create" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateImageForm parentId={parentId} />
							</DialogContent>
						</Dialog>
						<Dialog>
							<DialogTrigger asChild>
								<Button>
									<Folder />
									<Tran text="image.create-folder" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="image.create-folder" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateImageFolderForm parentId={parentId} />
							</DialogContent>
						</Dialog>
						<Button
							variant="secondary"
							onClick={() => {
								setUpdating(true);
								setUpdate(null);
							}}
						>
							<Pencil />
							<Tran text="image.update" />
						</Button>
						<Button variant="destructive" onClick={() => setDeleting(true)}>
							<Trash />
							<Tran text="image.delete" />
						</Button>
					</>
				)}
			</div>
			<Separator />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem onClick={() => setPath([])}>
						<Tran text="root" />
					</BreadcrumbItem>
					{path.length > 0 && <BreadcrumbSeparator />}
					{path.map((item, index) => (
						<Fragment key={item.id}>
							{index === path.length - 1 ? (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							) : (
								<BreadcrumbItem onClick={() => setParentId(item)}>{item.name}</BreadcrumbItem>
							)}
							{index < path.length - 1 && <BreadcrumbSeparator />}
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
			<ScrollContainer>
				<InfiniteApiItem
					className="grid grid-cols-[repeat(auto-fill,minmax(var(--size-file),1fr))] gap-2 text-muted-foreground"
					route={api.v4.images.get}
					queryKey={['images']}
					query={[{ parentId }, imageQuerySchema]}
				>
					{(pages) =>
						pages
							.flatMap((page) => page)
							.map((item) => (
								<div
									key={item.id}
									className={cn('overflow-hidden flex flex-col p-1 border rounded-md bg-card shadow-lg animate-in fade-in', {
										'border-destructive': isDeleting && deletes.includes(item.id),
									})}
									onClick={() => {
										if (isUpdating) {
											setUpdate(item);
										} else if (isDeleting) {
											handleSelect(item.id);
										} else {
											if (item.url) {
												copyToClipboard(item.url!);
											} else {
												setParentId(item);
											}
										}
									}}
								>
									{item.url ? (
										<NextImage
											className="rounded-md object-top w-full"
											width={item.width}
											height={item.height}
											src={item.url}
											alt={item.name}
										/>
									) : (
										<Folder className="w-full h-full" />
									)}
									<span className="mt-auto text-center text-sm text-ellipsis text-muted-foreground">{item.name}</span>
								</div>
							))
					}
				</InfiniteApiItem>
			</ScrollContainer>
			{!!update && (
				<Dialog open={!!update} onOpenChange={() => setUpdate(null)}>
					<DialogContent>
						<DialogTitle>
							<Tran text="image.update" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<UpdateImageFolderForm image={update} />
					</DialogContent>
				</Dialog>
			)}
		</PageWrapper>
	);
}

function CreateImageFolderForm({ parentId }: { parentId?: string | null }) {
	const form = useForm({
		resolver: zodResolver(createImageFolderSchema),
		defaultValues: {
			name: '',
			parentId: parentId || undefined,
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['images'],
		mutationFn: (data: z.infer<typeof createImageFolderSchema>) =>
			apiInstance.request(api.v4.images.folders.create, {
				body: data,
			}),
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);

			form.reset();
		},
		onError: (error) =>
			toast.error(<Tran text="upload.fail" />, { description: error.message }),

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['images'] });
		},
	});

	return (
		<Form {...form}>
			<form
				className="flex flex-1 flex-col justify-between space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit((data) => mutate(data))(event);
				}}
			>
				<FormError />
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="tags.name" />
							</FormLabel>
							<FormControl>
								<Input placeholder="Test" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="ml-auto grid w-fit grid-cols-2 justify-end gap-2">
					<Button variant="secondary" title="reset" onClick={() => form.reset()}>
						<Tran text="reset" />
					</Button>
					<Button type="submit" title="upload" disabled={isPending}>
						<Tran text="upload" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function UpdateImageFolderForm({ image }: { image: ImageDto }) {
	const form = useForm({
		resolver: zodResolver(updateImageFolderSchema),
		defaultValues: {
			name: image.name,
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['images'],
		mutationFn: (data: z.infer<typeof updateImageFolderSchema>) =>
			apiInstance.request(api.v4.images.folders.update, {
				body: data,
				params: {
					id: image.id,
				},
			}),
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			form.reset();
		},
		onError: (error) => {
			toast.error(<Tran text="upload.fail" />, { description: error.message });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['images'] });
		},
	});

	return (
		<Form {...form}>
			<form
				className="flex flex-1 flex-col justify-between space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit((data) => mutate(data))(event);
				}}
			>
				<FormError />
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="tags.name" />
							</FormLabel>
							<FormControl>
								<Input placeholder="Test" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="ml-auto grid w-fit grid-cols-2 justify-end gap-2">
					<Button variant="secondary" title="reset" onClick={() => form.reset()}>
						<Tran text="reset" />
					</Button>
					<Button type="submit" title="upload" disabled={isPending}>
						<Tran text="upload" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function IconSearchBar() {
	const [q, setQ] = useQueryState('q', {
		defaultValue: '',
	});

	return <SearchInput className="mr-auto" value={q} onChange={setQ} />;
}

function CreateImageForm({ parentId }: { parentId: string | null }) {
	const queryClient = useQueryClient();
	const [key, setKey] = useState(0);

	const { mutate, isPending } = useMutation({
		mutationKey: ['images'],
		mutationFn: (data: FormData) =>
			apiInstance.request(api.v4.images.create, {
				body: data as unknown as ApiBody<typeof api.v4.images.create>,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['images'],
			});
			setKey(key + 1);
		},
		onError: (error) => {
			toast.error(<Tran text="image.create-fail" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(files: FileList | null) {
		if (!files || files.length === 0) {
			return;
		}

		const data = new FormData();
		if (parentId) {
			data.append('parentId', parentId);
		}
		for (let i = 0; i < files.length; i++) {
			data.append('data', files[i]!);
		}
		mutate(data);
	}

	return (
		<div>
			<Input
				key={key}
				type="file"
				accept="image/*"
				disabled={isPending}
				multiple
				onChange={(e) => onSubmit(e.target.files)}
			/>
		</div>
	);
}
