'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { updateServerGroupSchema } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import ErrorMessage from '@/components/error/error-message';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ScrollContainer from '@/components/common/scroll-container';
import { Separator } from '@/components/ui/separator';
import { Tran } from '@/i18n/tran';
import { ManageGroupServers } from './components/manage-group-servers';

export default function GroupGeneralPage({ params }: PageProps<'/[locale]/server-groups/[groupId]'>) {
	const { groupId } = use(params);
	const queryClient = useQueryClient();

	const { data: group, isLoading, isError, error } = useQuery({
		queryKey: ['server-groups', groupId],
		queryFn: () => apiInstance.request(api.v4.serverGroups.get, { params: { groupId } }),
	});

	const form = useForm({
		resolver: zodResolver(updateServerGroupSchema),
		values: group ? { name: group.name, description: group.description } : { name: '', description: undefined },
	});

	const { mutate: updateGroup, isPending: isUpdating } = useMutation({
		mutationFn: (body: { name?: string; description?: string | null }) =>
			apiInstance.request(api.v4.serverGroups.update, { params: { groupId }, body }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
			toast.success(<Tran text="success" />);
		},
		onError: (err: any) => {
			toast.error(<Tran text="error" />, { description: err.message });
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <ErrorMessage error={error} />;

	return (
		<ScrollContainer className="flex-1 gap-6 w-full">
			<Form {...form}>
				<form className="flex flex-col gap-4" onSubmit={form.handleSubmit((data) => updateGroup(data))}>
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
									<Input {...field} value={field.value || ''} />
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
									<Input {...field} value={field.value || ''} autoComplete="off" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{form.formState.isDirty && (
						<div className="flex justify-end gap-2 mt-2">
							<Button type="submit" disabled={isUpdating}>
								<Tran text="save" />
							</Button>
						</div>
					)}
				</form>
			</Form>

			<Separator />

			<ManageGroupServers groupId={groupId} />
		</ScrollContainer>
	);
}
