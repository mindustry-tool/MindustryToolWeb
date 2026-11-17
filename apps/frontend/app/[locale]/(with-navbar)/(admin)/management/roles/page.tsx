'use client';

import type { ApiBody } from '@mindustry-tool/api';
import type { AuthorityEnum } from '@mindustry-tool/api';
import type { RoleDto } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { AUTHORITIES } from '@mindustry-tool/api';
import { createRoleSchema } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Pencil, Pipette, Plus, Trash } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MutateButton } from '@/components/buttons/mutate-button';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import { ApiItem } from '@/components/query/api-item';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { apiInstance } from '@/config/api';
import { useSession } from '@/hooks/use-session';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { cn, getBestRolePosition, getColor, TEXT_COLORS } from '@/lib/utils';
import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import ProtectedRoute from '@/components/layout/protected-route';

export default function Page() {
	return (
		<ProtectedRoute filter="god">
			<PageWrapper>
				<Tran className="text-xl font-semibold" text="role" />
				<Separator />
				<Accordion type="single" collapsible className="h-full overflow-hidden">
					<ScrollContainer>
						<Suspense>
							<ApiItem queryKey={['roles']} route={api.v4.roles.findAll}>
								{(items) =>
									items.sort((a, b) => b.level - a.level).map((item) => <RoleCard key={item.id} role={item} />)
								}
							</ApiItem>
						</Suspense>
					</ScrollContainer>
				</Accordion>
				<Separator />
				<Dialog>
					<DialogTrigger asChild>
						<Button className="ml-auto">
							<Plus />
							<Tran text="create" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<CreateRoleDialog />
					</DialogContent>
				</Dialog>
			</PageWrapper>
		</ProtectedRoute>
	);
}

function RoleCard({ role }: { role: RoleDto }) {
	const { id, color, level, members } = role;
	const { session } = useSession();

	const bestPosition = getBestRolePosition(session);
	const canEdit = bestPosition > role.level || hasAccess(session, 'god');

	return (
		<AccordionItem value={id}>
			<AccordionTrigger className="flex w-full items-center gap-2 rounded-md border-transparent bg-card p-2 text-base">
				<p className="font-bold text-primary">{level.toString().padStart(5, '0')}</p>
				<span
					className="font-semibold"
					style={{
						color: color || undefined,
					}}
				>
					{role.id}
				</span>
				<span className="ml-auto font-semibold">{members || undefined}</span>
			</AccordionTrigger>
			<Suspense>
				<AccordionContent className="mt-2 flex flex-col gap-2 rounded-md border bg-card/30 p-2">
					<EditRoleDialog role={role} />
					<Separator />
					<Tran className="text-lg font-semibold" text="delete" />
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button className="ml-auto" variant="destructive" disabled={!canEdit}>
								<Trash />
								<Tran text="delete" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle>
								<Tran text="delete" />
							</AlertDialogTitle>
							<AlertDialogDescription />
							<AlertDialogCancel>
								<Tran text="cancel" />
							</AlertDialogCancel>
							<MutateButton
								mutationKey={['roles', id]}
								variant="destructive"
								disabled={!canEdit}
								queryKey={['roles']}
								mutationFn={() =>
									apiInstance.request(api.v4.roles.delete, {
										params: {
											id,
										},
									})
								}
							>
								<Tran text="delete" />
							</MutateButton>
						</AlertDialogContent>
					</AlertDialog>
				</AccordionContent>
			</Suspense>
		</AccordionItem>
	);
}

function EditRoleDialog({ role }: { role: RoleDto }) {
	const { t } = useI18n('moderation');
	const form = useForm({
		resolver: zodResolver(createRoleSchema),
		values: {
			...role,
			description: 'Desc',
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: ApiBody<typeof api.v4.roles.update>) =>
			apiInstance.request(api.v4.roles.update, {
				body: data,
				params: {
					id: role.id,
				},
			}),
		onError: (error) => {
			toast.error(<Tran text="upload.fail" />, { description: error.message });
		},
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			form.reset();
			queryClient.invalidateQueries({ queryKey: ['roles'] });
		},
	});

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit((data) => mutate(data))}>
				<Tran className="px-1 text-lg font-semibold" text="edit"></Tran>
				<FormError />
				<FormField
					control={form.control}
					name="level"
					render={({ field }) => (
						<FormItem>
							<FormLabel><Tran text="moderation.role-level" /></FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										placeholder={t('moderation.role-level')}
										{...field}
										value={field.value ? String(field.value) : '0'}
										onChange={(event) => field.onChange(event.currentTarget.valueAsNumber)}
										type="number"
									/>
								</div>
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
										<Input {...field} value={field.value || ''} />
										<DialogTrigger className="flex aspect-square size-9 items-center justify-center rounded-md border">
											<Pipette className="size-5" />
										</DialogTrigger>
									</div>
								</FormControl>
								<DialogContent className="p-6">
									<DialogTitle />
									<DialogDescription />
									<HexColorPicker color={field.value || ''} onChange={field.onChange} />
									<p>{field.value}</p>
								</DialogContent>
							</Dialog>
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
											<Button variant="outline">
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
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="authorities"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="authorities" />
							</FormLabel>
							<FormControl>
								<ToggleGroup
									type="multiple"
									value={field.value}
									onValueChange={(values) =>
										field.onChange(values.filter((a) => AUTHORITIES.includes(a as AuthorityEnum)))
									}
									asChild
								>
									<div className="space-y-1 space-x-1">
										{AUTHORITIES.filter((a) => a !== 'god').map((authority) => (
											<ToggleGroupItem
												className={cn('rounded-md border', getColor(authority.split(':')[0], TEXT_COLORS))}
												key={authority}
												value={authority}
											>
												{authority}
											</ToggleGroupItem>
										))}
									</div>
								</ToggleGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex">
					<Button type="submit" className="ml-auto" disabled={isPending || !form.formState.isDirty}>
						<Pencil />
						<Tran text="save" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function CreateRoleDialog() {
	const { t } = useI18n('moderation');
	const form = useForm({
		resolver: zodResolver(createRoleSchema),
		defaultValues: {
			description: 'Desc',
			level: 0,
			authorities: [],
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: ApiBody<typeof api.v4.roles.create>) =>
			apiInstance.request(api.v4.roles.create, {
				body: data,
			}),
		onError: (error) => {
			toast.error(<Tran text="upload.fail" />, { description: error.message });
		},
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			form.reset();
			queryClient.invalidateQueries({ queryKey: ['roles'] });
		},
	});

	return (
		<>
			<DialogTitle>
				<Tran text="create" />
			</DialogTitle>
			<DialogDescription />
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit((data) => mutate(data))}>
					<FormError />
					<FormField
						control={form.control}
						name="id"
						render={({ field }) => (
							<FormItem>
								<FormLabel><Tran text="moderation.role-id" /></FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder={t('moderation.role-id')}
											{...field}
											value={field.value ? String(field.value) : ''}
											type="text"
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="level"
						render={({ field }) => (
						<FormItem>
							<FormLabel><Tran text="moderation.role-level" /></FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										placeholder={t('moderation.role-level')}
											{...field}
											value={field.value ? String(field.value) : '0'}
											onChange={(event) => field.onChange(event.currentTarget.valueAsNumber)}
											type="number"
										/>
									</div>
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
											<Input {...field} value={field.value || ''} />
											<DialogTrigger className="flex aspect-square size-9 items-center justify-center rounded-md border">
												<Pipette className="size-5" />
											</DialogTrigger>
										</div>
									</FormControl>
									<DialogContent className="p-6">
										<DialogTitle />
										<DialogDescription />
										<HexColorPicker color={field.value || ''} onChange={field.onChange} />
										<p>{field.value}</p>
									</DialogContent>
								</Dialog>
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
										<label
											className="flex h-9 items-center justify-center rounded-md border p-2"
											htmlFor="image"
											hidden
										>
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
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="authorities"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Tran text="authorities" />
								</FormLabel>
								<FormControl>
									<ToggleGroup
										type="multiple"
										value={field.value}
										onValueChange={(values) =>
											field.onChange(values.filter((a) => AUTHORITIES.includes(a as AuthorityEnum)))
										}
										asChild
									>
										<div className="space-y-1 space-x-1">
											{AUTHORITIES.filter((a) => a !== 'god').map((authority) => (
												<ToggleGroupItem
													className={cn('rounded-md border', getColor(authority.split(':')[0], TEXT_COLORS))}
													key={authority}
													value={authority}
												>
													{authority}
												</ToggleGroupItem>
											))}
										</div>
									</ToggleGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex">
						<Button type="submit" className="ml-auto" disabled={isPending}>
							<Tran text="create" />
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
