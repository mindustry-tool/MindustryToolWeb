'use client';

import { ReactNode } from 'react';
import { SearchInput } from '@/components/common/search-input';
import { ApiItem } from '@/components/query/api-item';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { UserAvatar, UserComponent, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { cn, getColor, TEXT_COLORS, BACKGROUND_COLORS } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiResult } from '@mindustry-tool/api';
import { SERVER_AUTHORITIES } from '@mindustry-tool/api';
import { ServerDto, updateServerAdminSchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ScrollContainer from '@/components/common/scroll-container';
import { LocalLink } from '@/components/common/locale-link';
import { Skeleton } from '@/components/ui/skeleton';
import { routes } from '@/config/routes';
import { useDebounceCallback } from 'usehooks-ts';
import { MoreHorizontal } from 'lucide-react';

export function ServerAdminSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<div className="bg-card rounded-xl flex items-center justify-between p-3.5 border shadow-sm">
				<div className="flex items-center gap-3">
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-6 w-20" />
			</div>
			<div className="bg-card rounded-xl flex items-center justify-between p-3.5 border shadow-sm">
				<div className="flex items-center gap-3">
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-6 w-20" />
			</div>
		</div>
	);
}

export function ManageServerAdminForm({ server, title }: { server: ServerDto; title?: ReactNode }) {
	return (
		<div className="flex flex-col h-full overflow-hidden gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{title ?? <Tran className="text-xl font-semibold" text="server.admin" />}
				<Dialog>
					<DialogTrigger asChild>
						<Button className="w-fit ml-auto" variant="default" size="sm">
							<Tran text="server.add-admin" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>
							<Tran text="server.add-admin" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<AddAdminForm server={server} />
					</DialogContent>
				</Dialog>
			</div>

			<ScrollContainer className="flex-1 gap-2">
				{server.groupId && (
					<ApiItem
						route={api.v4.serverGroups.admins.list}
						queryKey={['server-groups', server.groupId, 'admins']}
						params={{ groupId: server.groupId }}
						empty={() => null}
						loading={() => <ServerAdminSkeleton />}
					>
						{(groupAdmins) =>
							groupAdmins.length > 0 ? (
								<div className="flex flex-col gap-2">
									<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="group" />
									<div className="flex flex-col gap-2">
										{groupAdmins.map((item) => (
											<LocalLink
												key={item.id}
												href={routes.serverGroups.id({ id: server.groupId! }).admins}
												className="bg-card border rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 hover:border-primary/50 transition-all shadow-sm group cursor-pointer"
											>
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
											</LocalLink>
										))}
									</div>
									<Separator className="my-1" />
								</div>
							) : null
						}
					</ApiItem>
				)}
				<ApiItem
					route={api.v4.servers.admins.getAll}
					queryKey={['servers', server.id, 'admins']}
					params={{ id: server.id }}
					loading={() => <ServerAdminSkeleton />}
					empty={() => null}
				>
					{(items) =>
						items.length > 0 ? (
							<div className="flex flex-col gap-2">
								{server.groupId && (
									<Tran className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" text="server" />
								)}
								{items.map((item) => (
									<Dialog key={item.id}>
										<DialogTrigger asChild>
											<div className="bg-card border rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 hover:border-primary/50 transition-all shadow-sm group cursor-pointer w-full text-left">
												<div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
													<UserWithIdComponent userId={item.userId} clickable={false}>
														<UserAvatar className="h-8 w-8" />
														<UserName className="font-semibold text-sm" />
													</UserWithIdComponent>
													<div className="flex gap-1.5 flex-wrap items-center">
														{item.authorities.map((authority) => (
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
												<Tran text="server.update-admin" />
											</DialogTitle>
											<VisuallyHidden>
												<DialogDescription />
											</VisuallyHidden>
											<UpdateAdminForm data={item} />
										</DialogContent>
									</Dialog>
								))}
							</div>
						) : null
					}
				</ApiItem>
			</ScrollContainer>
		</div>
	);
}

function AddAdminForm({ server }: { server: ServerDto }) {
	const [input, setInput] = useState('');

	const form = useForm({
		resolver: zodResolver(updateServerAdminSchema),
		defaultValues: {
			authorities: [],
			userId: '',
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['servers', server.id, 'admins'],
		mutationFn: (data: ApiBody<typeof api.v4.servers.admins.update>) =>
			apiInstance.request(api.v4.servers.admins.update, {
				params: { id: server.id },
				body: data,
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['servers', server.id] });
			form.reset();
		},
	});

	function handleSubmit(data: ApiBody<typeof api.v4.servers.admins.update>) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<FormError />
				<FormField
					name="userId"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormControl>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											className={cn('w-fit', {
												'border-destructive': !!fieldState.error,
											})}
											variant="outline"
										>
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
											query={{
												q: input,
											}}
											loading={() => <LoadingSpinner />}
										>
											{(data) => {
												return data?.map((item) => (
													<Button
														key={item.id}
														className={cn('w-full max-w-sm justify-start px-1 arrow-selector', {
															'bg-primary text-primary-foreground': item.id === field.value,
														})}
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
												));
											}}
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
										field.onChange(
											values.filter((a) => SERVER_AUTHORITIES.includes(a as (typeof SERVER_AUTHORITIES)[number])),
										)
									}
									asChild
								>
									<div className="space-y-1 space-x-1">
										{SERVER_AUTHORITIES.map((authority) => (
											<ToggleGroupItem
												className={cn('rounded-md border', getColor(authority, TEXT_COLORS))}
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
				<Separator />
				<div className="flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline">
							<Tran text="cancel" />
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						<Tran text="server.add-admin" />
					</Button>
				</div>
			</form>
		</Form>
	);
}

function UpdateAdminForm({ data }: { data: ApiResult<typeof api.v4.servers.admins.getAll>[number] }) {
	const { serverId } = data;
	const [authorities, setAuthorities] = useState(data.authorities);

	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationKey: ['servers', serverId, 'admins'],
		mutationFn: (data: ApiBody<typeof api.v4.servers.admins.update>) =>
			apiInstance.request(api.v4.servers.admins.update, {
				params: { id: serverId },
				body: data,
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
			toast.success(<Tran text="success" />);
		},
	});

	const updateAuth = useDebounceCallback(mutate, 500);

	return (
		<div className="flex flex-col gap-4">
			<Tran text="authorities" />
			<ToggleGroup
				type="multiple"
				value={authorities}
				onValueChange={(values) => {
					const filteredValues = values.filter((a) =>
						SERVER_AUTHORITIES.includes(a as (typeof SERVER_AUTHORITIES)[number]),
					);
					setAuthorities(filteredValues);
					updateAuth({ ...data, authorities: filteredValues });
				}}
				asChild
			>
				<div className="space-y-1 space-x-1">
					{SERVER_AUTHORITIES.map((authority) => (
						<ToggleGroupItem
							className={cn('rounded-md border', getColor(authority, TEXT_COLORS))}
							key={authority}
							value={authority}
						>
							{authority}
						</ToggleGroupItem>
					))}
				</div>
			</ToggleGroup>

			<Separator />
			<div className="flex gap-2 justify-end">
				<DeleteAdminDialog data={data} />
			</div>
		</div>
	);
}

function DeleteAdminDialog({ data }: { data: ApiResult<typeof api.v4.servers.admins.getAll>[number] }) {
	const { id, serverId } = data;
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['servers', serverId, 'admins'],
		mutationFn: () =>
			apiInstance.request(api.v4.servers.admins.delete, {
				params: { id: serverId, adminId: id },
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
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
					<Button disabled={isPending} variant="destructive" onClick={() => mutate()}>
						<Tran text="delete" />
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
