import type { ApiBody } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createServerManagerSchema } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Plus, Radio, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';

export function CreateServerManagerDialog() {
	const form = useForm({
		resolver: zodResolver(createServerManagerSchema),
		defaultValues: {
			name: '',
			address: 'https://',
		},
	});

	const router = useRouter();
	const queryClient = useQueryClient();
	const { t } = useI18n('server');

	const { mutate, isPending } = useMutation({
		mutationFn: (body: ApiBody<typeof api.v4.servers.managers.create>) =>
			apiInstance.request(api.v4.servers.managers.create, {
				body,
			}),
		onSuccess: (result) => {
			toast.success(t('created-successfully'));
			queryClient.invalidateQueries({ queryKey: ['server-manager'] });
			form.reset();
			router.push(routes.serverManagers.id({ id: result.id }));
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: ApiBody<typeof api.v4.servers.managers.create>) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form className="flex h-full w-full flex-col gap-4 overflow-y-auto" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
					<div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
						<Radio className="size-4" />
					</div>
					<p className="text-xs text-muted-foreground">
						<Tran text="server.create-manager-description" />
					</p>
				</div>

				<FormError />

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-1.5 text-xs font-semibold">
								<Server className="size-3.5 text-muted-foreground" />
								<Tran text="server.name" />
							</FormLabel>
							<FormControl>
							<Input {...field} type="text" placeholder={t('name-placeholder')} className="h-9 text-sm" />
						</FormControl>
						<FormDescription className="text-[11px]">
							<Tran text="server.name-description" />
						</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-1.5 text-xs font-semibold">
								<Globe className="size-3.5 text-muted-foreground" />
								<Tran text="server.address" />
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="url"
									placeholder={t('address-placeholder')}
									className="h-9 text-sm font-mono"
									value={field.value.startsWith('https://') || field.value.startsWith('http://') ? field.value : `https://${field.value}`}
								/>
							</FormControl>
							<FormDescription className="text-[11px]">
								<Tran text="server.address-url-description" />
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2 pt-2 border-t mt-2">
					<Button className="h-9 gap-1.5 text-xs" type="submit" disabled={isPending}>
						{isPending ? (
							<LoadingSpinner />
						) : (
							<>
								<Plus className="size-3.5" />
								<Tran text="server.create-server-manager" />
							</>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
