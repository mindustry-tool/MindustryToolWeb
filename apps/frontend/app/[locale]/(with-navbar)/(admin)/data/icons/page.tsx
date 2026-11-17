'use client';
import type { IconDto } from '@mindustry-tool/api';

import type { z } from 'zod/v4-mini';

import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createIconSchema, iconQuerySchema, updateIconSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { useQueryState } from 'nuqs';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import ComboBox from '@/components/combo-box/combo-box';
import { SearchInput } from '@/components/common/search-input';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserWithAvatarAndName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { PageWrapper } from '@/components/common/page-wrapper';
import { LocaleDate } from '@/components/common/locale-date';

export default function Page() {
	return (
		<PageWrapper>
			<Suspense>
				<IconSearchBar />
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-20">
								<Tran text="icon.preview" />
							</TableHead>
							<TableHead className="w-40">
								<Tran text="icon.name" />
							</TableHead>
							<TableHead className="w-40">
								<Tran text="icon.group" />
							</TableHead>
							<TableHead className="w-60">
								<Tran text="icon.created-by" />
							</TableHead>
							<TableHead>
								<Tran text="icon.created-at" />
							</TableHead>
							<TableHead className="text-right"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="h-full overflow-y-auto">
						<Suspense>
							<ApiItem
								route={api.v4.icon.get}
								queryKey={['icons']}
								query={iconQuerySchema}
								error={(error) => (
									<TableRow>
										<TableCell className="col-span-full">{error.message}</TableCell>
									</TableRow>
								)}
							>
								{(items) => <IconRows items={items} />}
							</ApiItem>
						</Suspense>
					</TableBody>
				</Table>
				<Separator className="mt-auto" />
				<div className="flex items-center">
					<Suspense>
						<Dialog>
							<DialogTrigger asChild>
								<Button>
									<Plus />
									<Tran text="icon.create" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>
									<Tran text="icon.create" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateIconForm />
							</DialogContent>
						</Dialog>
						<ApiPagination className="ml-auto" route={api.v4.icon.count} queryKey={['icons']} query={iconQuerySchema} />
					</Suspense>
				</div>
			</Suspense>
		</PageWrapper>
	);
}

function IconRows({ items }: { items: IconDto[] }) {
	return items.map((icon: IconDto) => (
		<TableRow className="h-14 animate-in fade-in" key={icon.id}>
			<TableCell>
				<Image className="aspect-square rounded-sm object-cover" src={icon.url} alt={icon.id} width={32} height={32} />
			</TableCell>
			<TableCell className="overflow-hidden text-muted-foreground group-hover:text-foreground">:{icon.id}:</TableCell>
			<TableCell className="text-muted-foreground group-hover:text-foreground">{icon.group?.name}</TableCell>
			<TableCell className="overflow-hidden">
				<UserWithIdComponent userId={icon.createdBy}>
					<UserWithAvatarAndName />
				</UserWithIdComponent>
			</TableCell>
			<TableCell className="text-muted-foreground group-hover:text-foreground">
                <LocaleDate date={icon.createdAt} />
			</TableCell>
			<TableCell className="text-right" tabIndex={1}>
				<EllipsisButton variant="ghost">
					<Dialog>
						<DialogTrigger asChild>
							<Button className="justify-between" variant="ghost">
								<Tran text="edit" />
								<Pencil />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<UpdateIconForm icon={icon} />
						</DialogContent>
					</Dialog>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button className="justify-between" variant="destructive">
								<Tran text="icon.delete" />
								<TrashIcon />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle>
								<Tran text="icon.delete" />
							</AlertDialogTitle>
							<AlertDialogDescription>
								<Tran text="icon.delete.description" />
							</AlertDialogDescription>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<Tran text="common.cancel" />
								</AlertDialogCancel>
								<AlertDialogAction asChild>
									<DeleteIconButton iconId={icon.id} />
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</EllipsisButton>
			</TableCell>
		</TableRow>
	));
}

function IconSearchBar() {
	const [q, setQ] = useQueryState('q', {
		defaultValue: '',
	});

	return <SearchInput value={q} onChange={setQ} />;
}

function DeleteIconButton({ iconId: id }: { iconId: string }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['icon', id],
		mutationFn: (id: string) =>
			apiInstance.request(api.v4.icon.delete, {
				params: {
					id,
				},
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['icons'],
			});
		},

		onError: (error) => {
			toast.error(<Tran text="icon.delete.error" />, {
				description: error.message,
			});
		},
	});
	return (
		<Button variant="destructive" disabled={isPending} onClick={() => mutate(id)}>
			<Tran text="icon.delete" />
		</Button>
	);
}

function CreateIconForm() {
	const form = useForm({
		resolver: zodResolver(createIconSchema),
		defaultValues: {
			name: '',
			url: '',
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['icon'],
		mutationFn: (data: z.infer<typeof createIconSchema>) =>
			apiInstance.request(api.v4.icon.create, {
				body: data,
			}),
		onSuccess: () => {
			form.reset();

			queryClient.invalidateQueries({
				queryKey: ['icons'],
			});
		},
		onError: (error) => {
			toast.error(<Tran text="icon.create-fail" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: z.infer<typeof createIconSchema>) {
		mutate(data);
	}

	const { data } = useQuery({
		queryKey: ['icons', 'groups'],
		queryFn: () => apiInstance.request(api.v4.icon.getGroups, {}),
	});

	const groups = data || [];

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="icon.name" />
							</FormLabel>
							<FormControl>
								<Input placeholder="haha" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="groupId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="icon.group" />
							</FormLabel>
							<FormControl>
								<ComboBox
									value={groups.find((group) => group.id === field.value)}
									values={groups}
									render={(group) => group?.name}
									onChange={(group) => field.onChange(group?.id)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="url"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								<Tran text="icon.url" />
							</FormLabel>
							<FormControl>
								<div className="flex gap-2">
									<Dialog>
										<DialogTrigger type="button" asChild>
											<Button variant="outline" type="button">
												<Tran text="icon.select-image" />
											</Button>
										</DialogTrigger>
										<DialogContent className="w-fit p-0">
											<VisuallyHidden>
												<DialogTitle></DialogTitle>
												<DialogDescription></DialogDescription>
											</VisuallyHidden>
											<ImageSelectForm
												{...field}
												limit={5}
												onChange={(image) => {
													field.onChange(image ? image.url : null);
													form.setValue('name', image?.name ?? '');
												}}
												fieldState={fieldState}
												width={256}
												height={256}
											/>
										</DialogContent>
									</Dialog>
									{field.value && (
										<Image
											className="aspect-square rounded-sm object-cover"
											src={field.value}
											alt="icon preview"
											width={32}
											height={32}
										/>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div>
					<Button type="submit" disabled={isPending}>
						<Tran text="common.submit" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function UpdateIconForm({ icon }: { icon: IconDto }) {
	const form = useForm({
		resolver: zodResolver(updateIconSchema),
		defaultValues: icon,
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['icon'],
		mutationFn: (data: z.infer<typeof updateIconSchema>) =>
			apiInstance.request(api.v4.icon.update, {
				params: {
					id: icon.id,
				},
				body: data,
			}),
		onSuccess: () => {
			form.reset();

			queryClient.invalidateQueries({
				queryKey: ['icons'],
			});
		},
		onError: (error) => {
			toast.error(<Tran text="icon.create-fail" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: z.infer<typeof updateIconSchema>) {
		mutate(data);
	}

	const { data } = useQuery({
		queryKey: ['icons', 'groups'],
		queryFn: () => apiInstance.request(api.v4.icon.getGroups, {}),
	});

	const groups = data || [];

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					name="groupId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="icon.group" />
							</FormLabel>
							<FormControl>
								<ComboBox
									value={groups.find((group) => group.id === field.value)}
									values={groups}
									render={(group) => group?.name}
									onChange={(group) => field.onChange(group?.id)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="url"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								<Tran text="icon.url" />
							</FormLabel>
							<FormControl>
								<div className="flex gap-2">
									<Dialog>
										<DialogTrigger type="button" asChild>
											<Button variant="outline" type="button">
												<Tran text="icon.select-image" />
											</Button>
										</DialogTrigger>
										<DialogContent className="w-fit p-0">
											<VisuallyHidden>
												<DialogTitle></DialogTitle>
												<DialogDescription></DialogDescription>
											</VisuallyHidden>
											<ImageSelectForm
												{...field}
												limit={5}
												onChange={(image) => field.onChange(image ? image.url : null)}
												fieldState={fieldState}
												width={256}
												height={256}
											/>
										</DialogContent>
									</Dialog>
									{field.value && (
										<Image
											className="aspect-square rounded-sm object-cover"
											src={field.value}
											alt="icon preview"
											width={32}
											height={32}
										/>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div>
					<Button type="submit" disabled={isPending}>
						<Tran text="common.submit" />
					</Button>
				</div>
			</form>
		</Form>
	);
}
