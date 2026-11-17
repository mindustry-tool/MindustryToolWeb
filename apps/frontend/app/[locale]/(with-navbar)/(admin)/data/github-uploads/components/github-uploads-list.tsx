'use client';
import type { GitHubUpload, UpdateUploadRequest } from '@mindustry-tool/api';

import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { countGitHubUploadQuerySchema, getUploadsQuerySchema, updateUploadSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Edit, Github, Loader2, Plus, RefreshCw, Settings, Trash, Upload, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import { MutateButton } from '@/components/buttons/mutate-button';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserComponent, UserWithAvatarAndName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { LocaleDate } from '@/components/common/locale-date';

const STATUS_MAP: Record<
	GitHubUpload['status'],
	{
		className: string;
		icon: ReactNode;
	}
> = {
	COMPLETED: { className: 'bg-emerald-500 text-white', icon: <CheckCircle /> },
	DOWNLOADING: { className: 'bg-green-500 text-white', icon: <RefreshCw className="animate-spin-slow" /> },
	FAILED: { className: 'bg-red-500 text-white', icon: <XCircle /> },
	PENDING: { className: 'bg-yellow-500 text-white', icon: <RefreshCw className="animate-spin-slow" /> },
	PROCESSING: { className: 'bg-cyan-500 text-white', icon: <Settings className="animate-spin-slow" /> },
};

const GitHubUploadForm = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-upload-form'),
);

function extractUserAndRepoFromUrl(url: string) {
	const match = url.match(/https:\/\/github\.com\/([\w-]+)\/([\w-]+)/);

	if (!match) {
		return null;
	}

	return `${match[1]}/${match[2]}`;
}

export function GitHubUploadsList() {
	const [statusFilter] = useQueryState('status', {
		defaultValue: 'ALL',
	});

	const status = useMemo(() => {
		const res = getUploadsQuerySchema.def.shape.status.safeParse(statusFilter);
		return res.success ? res.data : undefined;
	}, [statusFilter]);

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<Table className="h-full overflow-y-auto">
				<TableHeader>
					<TableRow>
						<TableHead className="w-50">Repository</TableHead>
						<TableHead>Author</TableHead>
						<TableHead>Upload by</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>
							<span>Total</span>/<span className="text-emerald-400">Success</span>/
							<span className="text-destructive">Fail</span>/<span className="text-yellow-500">Duplicate</span>
						</TableHead>
						<TableHead>Updated At</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<ApiItem
						queryKey={['github-uploads']}
						route={api.v4.githubUploads.findAll}
						query={[getUploadsQuerySchema, { status }]}
					>
						{(uploads) =>
							uploads
								?.toReversed()
								.map(({ id, githubUrl, authorId, createdBy, status, success, fail, duplicate, createdAt, total }) => (
									<TableRow key={id}>
										<TableCell>{extractUserAndRepoFromUrl(githubUrl)}</TableCell>
										<TableCell>
											<UserWithIdComponent userId={authorId}>
												<UserWithAvatarAndName />
											</UserWithIdComponent>
										</TableCell>
										<TableCell>
											<UserWithIdComponent userId={createdBy}>
												<UserWithAvatarAndName />
											</UserWithIdComponent>
										</TableCell>
										<TableCell>
											<Badge className={STATUS_MAP[status]?.className} variant="secondary">
												{STATUS_MAP[status]?.icon}
												{status}
											</Badge>
										</TableCell>
										<TableCell>
											<span>{total}</span>/<span className="text-emerald-400">{success}</span>/
											<span className="text-destructive">{fail}</span>/
											<span className="text-yellow-500">{duplicate}</span>
										</TableCell>
										<TableCell>
											<LocaleDate date={createdAt}/>
										</TableCell>
										<TableCell>
											<EllipsisButton variant="ghost">
												{status !== 'PENDING' && (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="command" className="justify-between">
																<Tran text="refresh" />
																<RefreshCw className="h-4 w-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogTitle>Refresh Upload</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to refresh this upload?
															</AlertDialogDescription>
															<AlertDialogAction asChild>
																<RefreshButton upload={{ id, authorId }} />
															</AlertDialogAction>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
														</AlertDialogContent>
													</AlertDialog>
												)}
												<Dialog>
													<DialogTrigger asChild>
														<Button variant="command" className="justify-between">
															<Tran text="edit" />
															<Edit />
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogTitle>Edit</DialogTitle>
														<VisuallyHidden>
															<DialogDescription />
														</VisuallyHidden>
														<UpdateUploadForm upload={{ id, authorId, githubUrl }} />
													</DialogContent>
												</Dialog>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="command-destructive" className="justify-between">
															<Tran text="delete" />
															<Trash className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogTitle>Delete Upload</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete this upload?
														</AlertDialogDescription>
														<AlertDialogAction asChild>
															<MutateButton
																mutationKey={['github-upload', id]}
																variant="destructive"
																queryKey={['github-uploads']}
																mutationFn={() =>
																	apiInstance.request(api.v4.githubUploads.delete, {
																		params: {
																			id,
																		},
																	})
																}
															>
																<Tran text="delete" />
															</MutateButton>
														</AlertDialogAction>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
													</AlertDialogContent>
												</AlertDialog>
											</EllipsisButton>
										</TableCell>
									</TableRow>
								))
						}
					</ApiItem>
				</TableBody>
			</Table>
			<div className="mt-auto flex items-center">
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus />
							<Tran text="add" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Add GitHub Upload</DialogTitle>
						<DialogDescription>
							Enter the full GitHub repository URL. The repository will be downloaded and processed for Mindustry files.
						</DialogDescription>
						<GitHubUploadForm />
					</DialogContent>
				</Dialog>
				<ApiPagination
					className="ml-auto"
					route={api.v4.githubUploads.count}
					queryKey={['github-uploads']}
					query={countGitHubUploadQuerySchema}
				/>
			</div>
		</div>
	);
}

function RefreshButton({ upload }: { upload: { id: string; authorId: string } }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['github-upload'],
		mutationFn: () =>
			apiInstance.request(api.v4.githubUploads.update, {
				body: {
					status: 'PENDING',
					authorId: upload.authorId,
				},
				params: {
					id: upload.id,
				},
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['github-uploads'] });
		},
	});

	return (
		<Button disabled={isPending} onClick={() => mutate()}>
			<Tran text="refresh" />
		</Button>
	);
}

function UpdateUploadForm({ upload }: { upload: { id: string; authorId: string; githubUrl: string } }) {
	const queryClient = useQueryClient();

	const [query, setQuery] = useState('');

	const form = useForm<UpdateUploadRequest>({
		resolver: zodResolver(updateUploadSchema),
		defaultValues: upload,
	});

	const { data: users } = useQuery({
		queryKey: ['users', query],
		queryFn: async () =>
			apiInstance.request(api.v4.users.search, {
				query: { q: query },
			}),
	});

	const uploadMutation = useMutation({
		mutationFn: async (data: UpdateUploadRequest) => {
			return await apiInstance.request(api.v4.githubUploads.update, {
				body: data,
				params: {
					id: upload.id,
				},
			});
		},
		onSuccess: () => {
			toast.success('GitHub repository upload request updated successfully!');
			form.reset();
			// Invalidate uploads list to refresh
			queryClient.invalidateQueries({ queryKey: ['github-uploads'] });
		},
		onError: (error) => {
			toast.error(error?.message || 'Failed to update upload request');
		},
	});

	const onSubmit = (data: UpdateUploadRequest) => {
		uploadMutation.mutate(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="githubUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>GitHub Repository URL</FormLabel>
							<FormControl>
								<div className="relative">
									<Github className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="https://github.com/username/repository"
										className="pl-10"
										{...field}
										value={field.value ? String(field.value) : ''}
										type="url"
									/>
								</div>
							</FormControl>
							<FormDescription>
								Enter the full GitHub repository URL. The repository will be downloaded and processed for Mindustry
								files.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="authorId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Author</FormLabel>
							<div>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="outline">
											{field.value ? (
												<UserWithIdComponent userId={field.value} clickable={false}>
													<UserWithAvatarAndName />
												</UserWithIdComponent>
											) : (
												'Select an author'
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="grid max-h-[50vh] gap-1 overflow-y-auto">
										<Input
											placeholder="Search users"
											type="text"
											value={query}
											onChange={(e) => setQuery(e.currentTarget.value)}
										/>
										{users?.map((user) => (
											<Button
												key={user.id}
												onClick={() => field.onChange(user.id)}
												variant="ghost"
												className="justify-start"
											>
												<UserComponent data={user} clickable={false}>
													<UserWithAvatarAndName />
												</UserComponent>
											</Button>
										))}
									</PopoverContent>
								</Popover>
							</div>
							<FormDescription>
								Select the user who will be credited as the author of the uploaded content.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={uploadMutation.isPending} className="w-full">
					{uploadMutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating Upload Request...
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Upload Repository
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}
