'use client';

import { api } from '@mindustry-tool/api';
import { createServerGroupSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocalLink } from '@/components/common/locale-link';
import ScrollContainer from '@/components/common/scroll-container';
import { PageFooter, PageWrapper } from '@/components/common/page-wrapper';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import ColorText from '@/components/common/color-text';

export default function GroupsPage() {
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['server-groups'],
		queryFn: () => apiInstance.request(api.v4.serverGroups.list, {}),
	});

	const { mutate: deleteGroup } = useMutation({
		mutationFn: (groupId: string) =>
			apiInstance.request(api.v4.serverGroups.delete, { params: { groupId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups'] });
			toast.success(<Tran text="success" />);
		},
		onError: (err: any) => {
			toast.error(<Tran text="error" />, { description: err.message });
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <ErrorMessage error={error} />;

	return (
		<PageWrapper>
			<ScrollContainer>
				<div className="flex flex-col gap-4 p-4">
					<div className="flex items-center justify-between">
						<Tran className="text-2xl font-semibold" text="server.server-groups" />
					</div>
					{(!data || data.length === 0) ? (
						<div className="text-center text-muted-foreground py-8">
							<Tran text="server.no-server-groups" />
						</div>
					) : (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{data.map((group: any) => (
								<LocalLink
									key={group.id}
									href={routes.serverGroups.id({ id: group.id }).value}
									className="flex flex-col gap-2 rounded-md border bg-card/50 p-3 shadow-md hover:bg-card/80 transition-colors"
								>
									<div className="flex items-center justify-between">
										<ColorText className="font-semibold text-lg" text={group.name} />
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-destructive"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												deleteGroup(group.id);
											}}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
									{group.description && (
										<ColorText className="text-sm text-muted-foreground line-clamp-2" text={group.description} />
									)}
								</LocalLink>
							))}
						</div>
					)}
				</div>
			</ScrollContainer>
			<Separator className="mt-auto" />
			<PageFooter className="ml-auto">
				<CreateGroupDialog />
			</PageFooter>
		</PageWrapper>
	);
}

function CreateGroupDialog() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const { t } = useI18n('common');

	const form = useForm({
		resolver: zodResolver(createServerGroupSchema),
		defaultValues: { name: '', description: '' },
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (body: { name: string; description?: string }) =>
			apiInstance.request(api.v4.serverGroups.create, { body }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups'] });
			form.reset();
			setOpen(false);
		},
		onError: (err: any) => {
			toast.error(<Tran text="error" />, { description: err.message });
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="size-4 mr-1" />
					<Tran text="server.create-group" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="server.create-group" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<Form {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit((data) => mutate(data))}>
						<FormError />
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Tran text="name" />
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder={t('my-server-group')} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Tran text="description" />
									</FormLabel>
									<FormControl>
										<AutosizeTextarea value={field.value || ''} onChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-2">
							<DialogClose asChild>
								<Button variant="outline">
									<Tran text="cancel" />
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isPending}>
								<Tran text="create" />
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
