'use client';

import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ApiItem } from '@/components/query/api-item';
import { RevealValue } from '@/components/common/reveal-value';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiInstance } from '@/config/api';
import ScrollContainer from '@/components/common/scroll-container';
import { Tran } from '@/i18n/tran';
import { upsertGroupServerEnvSchema } from '@mindustry-tool/api';

import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

export function ManageGroupEnvForm({ groupId, title }: { groupId: string; title?: ReactNode }) {
	const queryClient = useQueryClient();

	const { mutate: deleteEnv } = useMutation({
		mutationFn: (envId: string) => apiInstance.request(api.v4.serverGroups.envs.delete, { params: { groupId, envId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	return (
		<div className="flex flex-col h-full overflow-hidden gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{title ?? <Tran className="text-xl font-semibold" text="server.env" />}
				<Dialog>
					<DialogTrigger asChild>
						<Button className="w-fit ml-auto" variant="default" size="sm">
							<Tran text="server.add-env" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>
							<Tran text="server.add-env" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<EnvForm groupId={groupId} />
					</DialogContent>
				</Dialog>
			</div>

			<ScrollContainer className="flex-1 gap-2">
				<ApiItem
					route={api.v4.serverGroups.envs.list}
					queryKey={['server-groups', groupId, 'envs']}
					params={{ groupId }}
					loading={() => (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-10 w-full rounded-md" />
							<Skeleton className="h-10 w-full rounded-md" />
						</div>
					)}
					empty={() => (
						<div className="text-center text-muted-foreground py-4">
							<Tran text="server.no-envs" />
						</div>
					)}
				>
					{(items) =>
						items.map((item) => (
							<div key={item.id} className="flex items-center gap-2 rounded-md border bg-card/50 p-2">
								<div className="flex-1 flex items-center gap-2">
									<span className="font-mono text-sm font-semibold">{item.name}</span>
									<span className="text-muted-foreground">=</span>
									<RevealValue value={item.value} />
								</div>
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="ghost" size="icon" className="size-8">
											<Pencil className="size-4" />
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogTitle>
											<Tran text="edit-env" />
										</DialogTitle>
										<VisuallyHidden>
											<DialogDescription />
										</VisuallyHidden>
										<EnvForm groupId={groupId} initial={{ name: item.name, value: item.value }} />
									</DialogContent>
								</Dialog>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="ghost" size="icon" className="size-8 text-destructive">
											<Trash2 className="size-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogTitle>
											<Tran text="server.delete-env" />
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
											<Button variant="destructive" onClick={() => deleteEnv(item.id)}>
												<Tran text="delete" />
											</Button>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						))
					}
				</ApiItem>
			</ScrollContainer>
		</div>
	);
}

export function EnvForm({ groupId, initial }: { groupId: string; initial?: { name: string; value: string } }) {
	const queryClient = useQueryClient();
	const [valueVisible, setValueVisible] = useState(false);

	const form = useForm({
		resolver: zodResolver(upsertGroupServerEnvSchema),
		defaultValues: { name: initial?.name || '', value: initial?.value || '' },
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (data: { name: string; value: string }) =>
			apiInstance.request(api.v4.serverGroups.envs.upsert, { params: { groupId }, body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
			queryClient.invalidateQueries({ queryKey: ['servers'] });
			form.reset();
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit((data) => mutate(data))} autoComplete="off">
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
								<Input {...field} placeholder="JAVA_OPTS" disabled={!!initial} autoComplete="off" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="value"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="value" />
							</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										{...field}
										type={valueVisible ? 'text' : 'password'}
										placeholder="-Xmx512M"
										className="pr-10"
										autoComplete="new-password"
										data-1p-ignore
										data-lpignore="true"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
										aria-label={valueVisible ? 'Hide value' : 'Show value'}
										onClick={() => setValueVisible((prev) => !prev)}
									>
										{valueVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</Button>
								</div>
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
						<Tran text={initial ? 'save' : 'add'} />
					</Button>
				</div>
			</form>
		</Form>
	);
}
