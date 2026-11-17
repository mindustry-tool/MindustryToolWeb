'use client';
import type { CreateUploadRequest } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createUploadSchema } from '@mindustry-tool/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Github, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserComponent, UserWithAvatarAndName } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';

export default function GitHubUploadForm() {
	const queryClient = useQueryClient();

	const [query, setQuery] = useState('');

	const form = useForm<CreateUploadRequest>({
		resolver: zodResolver(createUploadSchema),
		defaultValues: {
			githubUrl: '',
			authorId: '',
		},
	});

	const { data: users } = useQuery({
		queryKey: ['users', query],
		queryFn: async () =>
			apiInstance.request(api.v4.users.search, {
				query: { q: query },
			}),
	});

	const uploadMutation = useMutation({
		mutationFn: async (data: CreateUploadRequest) => {
			return await apiInstance.request(api.v4.githubUploads.create, {
				body: data,
			});
		},
		onSuccess: () => {
			toast.success('GitHub repository upload request created successfully!');
			form.reset();
			// Invalidate uploads list to refresh
			queryClient.invalidateQueries({ queryKey: ['github-uploads'] });
		},
		onError: (error) => {
			toast.error(error?.message || 'Failed to create upload request');
		},
	});

	const onSubmit = (data: CreateUploadRequest) => {
		uploadMutation.mutate(data);
	};

	// eslint-disable-next-line react-hooks/incompatible-library
	const selectedUser = users?.find((user) => user.id === form.watch('authorId'));

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
											{selectedUser ? (
												<UserComponent data={selectedUser} clickable={false}>
													<UserWithAvatarAndName />
												</UserComponent>
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
