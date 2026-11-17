'use client';

import { api } from '@mindustry-tool/api';
import { SERVER_AUTHORITIES } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchInput } from '@/components/common/search-input';
import { ApiItem } from '@/components/query/api-item';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { UserAvatar, UserComponent, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { cn, getColor, TEXT_COLORS, BACKGROUND_COLORS } from '@/lib/utils';
import { upsertGroupServerAdminSchema } from '@mindustry-tool/api';
import ScrollContainer from '@/components/common/scroll-container';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

export function GroupAdminSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-16 w-full rounded-xl" />
			<Skeleton className="h-16 w-full rounded-xl" />
		</div>
	);
}

export function ManageGroupAdminForm({ groupId, title }: { groupId: string; title?: ReactNode }) {
	return (
		<div className="flex flex-col h-full overflow-hidden gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{title ?? <Tran className="text-xl font-semibold" text="server.admin" />}
				<Dialog>
					<DialogTrigger asChild>
						<Button className="w-fit ml-auto" variant="default" size="sm">
							<Tran text="add-admin" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>
							<Tran text="add-admin" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<AddGroupAdminForm groupId={groupId} />
					</DialogContent>
				</Dialog>
			</div>

			<ScrollContainer className="flex-1 gap-2">
				<ApiItem
					route={api.v4.serverGroups.admins.list}
					queryKey={['server-groups', groupId, 'admins']}
					params={{ groupId }}
					loading={() => <GroupAdminSkeleton />}
					empty={() => (
						<div className="text-center text-muted-foreground py-4">
							<Tran text="no-admins" />
						</div>
					)}
				>
					{(items) =>
						items.map((item) => (
							<Dialog key={item.id}>
								<DialogTrigger asChild>
									<div className="bg-card border rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 hover:border-primary/50 transition-all shadow-sm group cursor-pointer w-full text-left">
										<div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
											<UserWithIdComponent userId={item.userId} clickable={false}>
												<UserAvatar className="h-8 w-8" />
												<UserName className="font-semibold text-sm" />
											</UserWithIdComponent>
											<div className="flex gap-1.5 flex-wrap items-center">
												{item.authorities.map((authority: string) => (
													<div
														key={authority}
														className={cn(
															'px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide whitespace-nowrap border-border/30',
															getColor(authority, TEXT_COLORS),
															getColor(authority, BACKGROUND_COLORS),
														)}
													>
														{authority}
													</div>
												))}
											</div>
										</div>
										<div className="text-muted-foreground/60 group-hover:text-foreground transition-colors p-1 shrink-0 ml-auto">
											<MoreHorizontal className="w-4 h-4" />
										</div>
									</div>
								</DialogTrigger>
								<DialogContent>
									<DialogTitle>
										<Tran text="update-admin" />
									</DialogTitle>
									<VisuallyHidden>
										<DialogDescription />
									</VisuallyHidden>
									<UpdateGroupAdminForm data={item} groupId={groupId} />
								</DialogContent>
							</Dialog>
						))
					}
				</ApiItem>
			</ScrollContainer>
		</div>
	);
}

function AddGroupAdminForm({ groupId }: { groupId: string }) {
	const [input, setInput] = useState('');

	const form = useForm({
		resolver: zodResolver(upsertGroupServerAdminSchema),
		defaultValues: { authorities: [], userId: '' },
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: any) =>
			apiInstance.request(api.v4.serverGroups.admins.upsert, { params: { groupId }, body: data }),
		onError: (error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
			form.reset();
		},
	});

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit((data) => mutate(data))}>
				<FormError />
				<FormField
					name="userId"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormControl>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button className={cn('w-fit', { 'border-destructive': !!fieldState.error })} variant="outline">
											{field.value ? (
												<UserWithIdComponent userId={field.value} clickable={false}>
													<UserAvatar />
													<UserName />
												</UserWithIdComponent>
											) : (
												<Tran text="select-user" />
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="grid gap-2">
										<SearchInput value={input} onChange={setInput} />
										<ApiItem
											route={api.v4.users.search}
											queryKey={['authors']}
											query={{ q: input }}
											loading={() => <LoadingSpinner />}
										>
											{(data: any) =>
												data?.map((item: any) => (
													<Button
														key={item.id}
														className={cn('w-full max-w-sm justify-start px-1', { 'bg-primary text-primary-foreground': item.id === field.value })}
														size="sm"
														variant="command"
														onClick={() => {
															field.onChange(item.id);
															queryClient.setQueryData(['users', item.id], item);
														}}
													>
														<UserComponent data={item} clickable={false}>
															<UserAvatar />
															<UserName />
														</UserComponent>
													</Button>
												))
											}
										</ApiItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</FormControl>
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
										field.onChange(values.filter((a) => SERVER_AUTHORITIES.includes(a as any)))
									}
									asChild
								>
									<div className="space-y-1 space-x-1">
										{SERVER_AUTHORITIES.map((authority) => (
											<ToggleGroupItem className={cn('rounded-md border', getColor(authority, TEXT_COLORS))} key={authority} value={authority}>
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
				<Separator />
				<div className="flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline">
							<Tran text="cancel" />
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						<Tran text="add" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function UpdateGroupAdminForm({ data, groupId }: { data: any; groupId: string }) {
	const [authorities, setAuthorities] = useState(data.authorities);
	const queryClient = useQueryClient();

	const { mutate: deleteAdmin, isPending: isDeleting } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.serverGroups.admins.delete, { params: { groupId, adminId: data.id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	const { mutate: updateAuth } = useMutation({
		mutationFn: (auths: string[]) =>
			apiInstance.request(api.v4.serverGroups.admins.upsert, {
				params: { groupId },
				body: { userId: data.userId, authorities: auths },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<Tran text="authorities" />
			<ToggleGroup
				type="multiple"
				value={authorities}
				onValueChange={(values) => {
					const filtered = values.filter((a) => SERVER_AUTHORITIES.includes(a as any));
					setAuthorities(filtered);
					updateAuth(filtered);
				}}
				asChild
			>
				<div className="space-y-1 space-x-1">
					{SERVER_AUTHORITIES.map((authority) => (
						<ToggleGroupItem className={cn('rounded-md border', getColor(authority, TEXT_COLORS))} key={authority} value={authority}>
							{authority}
						</ToggleGroupItem>
					))}
				</div>
			</ToggleGroup>
			<Separator />
			<div className="flex gap-2 justify-end">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive" disabled={isDeleting}>
							<Tran text="delete" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogTitle>
							<Tran text="delete" />
						</AlertDialogTitle>
						<VisuallyHidden>
							<AlertDialogDescription />
						</VisuallyHidden>
						<AlertDialogFooter>
							<AlertDialogCancel asChild>
								<Button variant="outline">
									<Tran text="cancel" />
								</Button>
							</AlertDialogCancel>
							<Button variant="destructive" onClick={() => deleteAdmin()}>
								<Tran text="delete" />
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
