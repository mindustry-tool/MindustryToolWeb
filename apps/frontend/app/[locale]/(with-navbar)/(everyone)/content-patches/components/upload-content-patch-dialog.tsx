import ComboBox from '@/components/combo-box/combo-box';
import { ContentPatchPreviewCard } from '@/components/content-patch/content-patch-preview-card';
import { ApiItem } from '@/components/query/api-item';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { CONTENT_PATCH_TYPE, ContentPatchType, createContentPatchSchema, queryContentPatchSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4-mini';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];
const CREATE_CONTENT_PATCH_MUTATION_KEY = ['content-patches', 'create'];

export default function UploadContentPatchDialog({ onSuccess }: { onSuccess: () => void }) {
	const queryClient = useQueryClient();
	const form = useForm({
		resolver: zodResolver(createContentPatchSchema),
		defaultValues: {
			name: '',
			description: '',
			data: '[]',
			type: 'DATA' as ContentPatchType,
		},
	});

	const { mutate, isPending } = useMutation({
		mutationKey: CREATE_CONTENT_PATCH_MUTATION_KEY,
		mutationFn: (data: z.infer<typeof createContentPatchSchema>) =>
			apiInstance.request(api.v4.contentPatches.create, {
				body: data,
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({ queryKey: CONTENT_PATCHES_QUERY_KEY });
			onSuccess();
		},
	});

	function onSubmit(data: z.infer<typeof createContentPatchSchema>) {
		mutate(data);
	}

	function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsText(file);
			reader.onload = () => {
				form.setValue('data', reader.result as string);
			};
		}
	}

	return (
		<Form {...form}>
			<form className="flex h-full w-full flex-col gap-4 overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
				<FormError />
				<div className="flex h-full w-full flex-col gap-4 overflow-y-auto py-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Tran text="content-patch.name" />
								</FormLabel>
								<FormControl>
									<Input {...field} type="text" />
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
									<Tran text="content-patch.description" />
								</FormLabel>
								<FormControl>
									<AutosizeTextarea value={field.value || ''} onChange={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Tran text="content-patch.type" />
								</FormLabel>
								<FormControl>
									<ComboBox
										required
										value={field.value as ContentPatchType}
										values={CONTENT_PATCH_TYPE}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/* eslint-disable-next-line react-hooks/incompatible-library */}
					{form.watch('type') === 'DATA' && (
						<>
							<FormField
								control={form.control}
								name="data"
								render={() => (
									<FormItem>
										<FormLabel>
											<Tran text="content-patch.data" />
										</FormLabel>
										<FormControl>
											<Input type="file" accept=".hjson, .json, .txt" onChange={onFileChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="data"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="content-patch.data" />
										</FormLabel>
										<FormControl>
											<AutosizeTextarea className="h-full" value={field.value || ''} onChange={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}
					{form.watch('type') === 'DATAPACK' && (
						<FormField
							control={form.control}
							name="data"
							render={({ field }) => <AddContentPatchDataPack {...field} />}
						/>
					)}
				</div>
				<div className="flex justify-end">
					<Button type="submit" disabled={isPending}>
						<Tran text="upload" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function AddContentPatchDataPack({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	const json = useMemo(() => {
		try {
			return z.array(z.uuidv7()).parse(JSON.parse(value));
		} catch (error) {
			console.warn(error);
			return [];
		}
	}, [value]);

	function handleChange(id: string) {
		if (json.includes(id)) {
			onChange(JSON.stringify(json.filter((item) => item !== id)));
		} else {
			onChange(JSON.stringify([...json, id]));
		}
	}

	return (
		<FormItem>
			<FormLabel>
				<Tran text="content-patch.data" />
			</FormLabel>
			<FormControl>
				<div className="flex gap-2 items-center flex-wrap">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">
								<Plus />
								<Tran text="content-patch.add" />
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[80dvh]">
							<DialogTitle>
								<Tran text="content-patch.add" />
							</DialogTitle>
							<VisuallyHidden>
								<DialogDescription />
							</VisuallyHidden>
							<div className="flex flex-col gap-2">
								<ApiItem
									route={api.v4.contentPatches.getAll}
									queryKey={CONTENT_PATCHES_QUERY_KEY}
									query={[queryContentPatchSchema, { verification: 'VERIFIED' }]}
									empty={() => <div className="col-span-full text-center text-xl">No item found</div>}
								>
									{(items) =>
										items.map((item) => (
											<ContentPatchPreviewCard key={item.id} data={item}>
												<Button onClick={() => handleChange(item.id)}>
													{json.includes(item.id) ? (
														<>
															<Minus />
															<Tran text="content-patch.remove" />
														</>
													) : (
														<>
															<Plus />
															<Tran text="content-patch.add" />
														</>
													)}
												</Button>
											</ContentPatchPreviewCard>
										))
									}
								</ApiItem>
							</div>
						</DialogContent>
					</Dialog>
					{json.map((id) => (
						<Button key={id} variant="secondary">
							{id}
						</Button>
					))}
				</div>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
}
