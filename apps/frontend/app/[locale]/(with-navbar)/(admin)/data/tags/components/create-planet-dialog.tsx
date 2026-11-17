import type { z } from 'zod/v4-mini';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createPlanetSchema } from '@mindustry-tool/api';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { ImageSelectForm } from '@/components/forms/image-select.form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import {
	Form,
	FormControl,
	FormDescription,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export default function CreatePlanetDialog({ onSuccess }: { onSuccess: () => void }) {
	const form = useForm({
		resolver: zodResolver(createPlanetSchema),
		defaultValues: {
			name: '',
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: z.infer<typeof createPlanetSchema>) =>
			apiInstance.request(api.v4.planets.create, {
				body: data,
			}),
		mutationKey: ['planet'],
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);

			form.reset();
			onSuccess();
		},
		onError: (error) =>
			toast.error(<Tran text="upload.fail" />, { description: error.message }),

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });
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
				<FormField
					control={form.control}
					name="icon"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								<Tran text="tags.icon" />
							</FormLabel>
							<FormControl>
								<div className="flex gap-2">
									<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>
										<ImageIcon className="size-5" />
									</label>
									<Dialog>
										<DialogTrigger asChild>
											<Button>
												<ImageIcon className="size-5" />
												<Tran text="select-image" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<VisuallyHidden>
												<DialogTitle />
												<DialogDescription />
											</VisuallyHidden>
											<ImageSelectForm
												fieldState={fieldState}
												width={32}
												height={32}
												value={field.value}
												onChange={(image) => field.onChange(image ? image.url : null)}
											/>
										</DialogContent>
									</Dialog>
									{field.value && (
										<Image
											key={field.value}
											width={32}
											height={32}
											className="size-32 rounded-md border object-cover"
											src={field.value}
											loader={({ src }) => src}
											alt="preview"
										/>
									)}
								</div>
							</FormControl>
							<FormDescription>
								<Tran text="tags.icon-description" />
							</FormDescription>
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
