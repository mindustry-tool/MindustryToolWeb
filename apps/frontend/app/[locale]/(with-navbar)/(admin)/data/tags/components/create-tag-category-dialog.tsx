import type { z } from 'zod/v4-mini';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createTagCategorySchema } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Pipette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Switch } from '@/components/ui/switch';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export default function CreateTagCategoryDialog({ onSuccess }: { onSuccess: () => void }) {
	const form = useForm<z.infer<typeof createTagCategorySchema>>({
		resolver: zodResolver(createTagCategorySchema),
		defaultValues: {
			name: '',
			color: '',
			duplicate: false,
			position: 0,
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: z.infer<typeof createTagCategorySchema>) =>
			apiInstance.request(api.v4.tags.categories.create, {
				body: data,
			}),
		mutationKey: ['tags'],
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			form.reset();

			queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });

			onSuccess();
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
				<FormField
					control={form.control}
					name="color"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="color" />
							</FormLabel>
							<Dialog>
								<FormControl>
									<div className="flex gap-2">
										<Input {...field} />
										<DialogTrigger className="flex aspect-square size-9 items-center justify-center rounded-md border">
											<Pipette />
										</DialogTrigger>
									</div>
								</FormControl>
								<DialogContent className="p-6">
									<DialogTitle />
									<DialogDescription />
									<HexColorPicker color={field.value} onChange={field.onChange} />
									<p>{field.value}</p>
								</DialogContent>
							</Dialog>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="duplicate"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center gap-2">
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<FormLabel>
									<Tran text="tags.duplicate" />
								</FormLabel>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="position"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="tags.position" />
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									value={field.value}
									onChange={(event) => field.onChange(event.target.valueAsNumber)}
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
