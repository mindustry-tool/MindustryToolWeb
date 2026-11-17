import type { ItemType } from '@mindustry-tool/api';
import type { z } from 'zod/v4-mini';
import { zodResolver } from '@hookform/resolvers/zod';

import { api } from '@mindustry-tool/api';
import { createTagGroupDtoSchema } from '@mindustry-tool/api';
import { ITEM_TYPES } from '@mindustry-tool/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import ComboBox from '@/components/combo-box/combo-box';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export default function CreateTagGroupDialog({
	group,
	currentCategories,
	onSuccess,
}: {
	group?: string;
	currentCategories: string[];
	onSuccess: () => void;
}) {
	const form = useForm<z.infer<typeof createTagGroupDtoSchema>>({
		resolver: zodResolver(createTagGroupDtoSchema),
		defaultValues: {
			group: (group ?? ITEM_TYPES[0]) as ItemType,
		},
	});

	const queryClient = useQueryClient();

	const { data: categoryQuery } = useQuery({
		queryKey: ['tag-category'],
		queryFn: () => apiInstance.request(api.v4.tags.categories.findAll, {}),
	});

	const categories = (categoryQuery ?? []).filter((category) => !currentCategories.includes(category.id));

	const { mutate, isPending } = useMutation({
		mutationFn: (data: z.infer<typeof createTagGroupDtoSchema>) =>
			apiInstance.request(api.v4.tags.groups.create, {
				body: data,
			}),
		mutationKey: ['tags'],
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			form.reset();

			queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
			queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });

			onSuccess?.();
		},
		onError: (error) => {
			toast.error(<Tran text="upload.fail" />, { description: error.message });
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
				{group !== undefined || (
					<FormField
						control={form.control}
						name="group"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Tran text="tags.name" />
								</FormLabel>
								<FormControl>
									<ComboBox required value={field.value} values={ITEM_TYPES} onChange={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				<FormField
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<FormItem className="flex flex-col gap-2">
							<FormLabel>
								<Tran text="category" />
							</FormLabel>
							<FormControl>
								<ComboBox
									value={categories.find((category) => category.id === field.value)}
									values={categories}
									onChange={(value) => field.onChange(value?.id)}
									render={(value) => value?.name}
								/>
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
