'use client';

import type { ApiBody } from '@mindustry-tool/api';
import type { ServerDto } from '@mindustry-tool/api';
import type { ServerMode } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { updateServerSchema } from '@mindustry-tool/api';
import { SERVER_IMAGES, SERVER_MODES, SERVER_GAMEMODES } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ComboBox from '@/components/combo-box/combo-box';
import SuggestionInput from '@/components/combo-box/suggestion-input';
import ColorText from '@/components/common/color-text';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
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
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';

export function UpdateServerForm({ server }: { server: ServerDto }) {
	const { data } = useQuery({
		queryKey: ['server', 'isOwner', server.id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.managers.isOwner, {
				params: {
					id: server.id,
				},
			}),
	});

	const { session } = useSession();
	const queryClient = useQueryClient();

	const isOwner = !!data;
	const isAdmin = hasAccess(session, 'server:manage');

	const canEditPort = isOwner || isAdmin;

	const form = useForm({
		resolver: zodResolver(updateServerSchema),
		defaultValues: {
			...server,
			description: server.description || '',
			mode: server.mode as ServerMode,
			gamemode: server.gamemode || '',
			hostCommand: server.hostCommand || '',
			avatar: server.avatar || '',
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (body: ApiBody<typeof api.v4.servers.update>) =>
			apiInstance.request(api.v4.servers.update, {
				body,
				params: {
					id: server.id,
				},
			}),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['servers'],
				exact: false,
			});
			toast.success(<Tran text="success" />, {
				description: <Tran text="server.updated" />,
			});
			form.reset({
				...data,
				description: data.description || '',
				mode: data.mode as ServerMode,
				gamemode: data.gamemode || '',
				hostCommand: data.hostCommand || '',
				avatar: data.avatar || '',
			});
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: ApiBody<typeof api.v4.servers.update>) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form className="flex h-full w-full flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormError />
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.name" />
							</FormLabel>
							<FormControl>
								<Input {...field} type="text" placeholder="[red]Test[blue]Server" />
							</FormControl>
							{field.value && (
								<span className="text-sm">
									<Tran className="font-semibold" text="preview" />:
									<span className="ml-1">
										<ColorText text={field.value} />
									</span>
								</span>
							)}
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
								<Tran text="server.description" />
							</FormLabel>
							<FormControl>
								<AutosizeTextarea value={field.value || ''} onChange={field.onChange} />
							</FormControl>
							{field.value && (
								<span className="text-sm">
									<Tran className="font-semibold" text="preview" />:
									<span className="ml-1">
										<ColorText text={field.value} />
									</span>
								</span>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="avatar"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.avatar" />
							</FormLabel>
							<FormControl>
								<div className="flex flex-col gap-2">
									<label className="flex h-9 items-center justify-center rounded-md border p-2" htmlFor="image" hidden>
										<ImageIcon className="size-5" />
									</label>
									<Dialog>
										<DialogTrigger asChild>
											<Button className="w-fit" variant="outline">
												<ImageIcon className="size-5" />
												<Tran text="select-image" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogTitle>
												<Tran text="selected-image" />
											</DialogTitle>
											<VisuallyHidden>
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
								<Tran text="server.avatar-description" />
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="mode"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.mode" />
							</FormLabel>
							<FormControl>
								<ComboBox required value={field.value} values={SERVER_MODES} onChange={field.onChange} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gamemode"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.gamemode" />
							</FormLabel>
							<FormControl>
								<SuggestionInput value={field.value || ''} values={[...SERVER_GAMEMODES]} onChange={field.onChange} />
							</FormControl>
							<FormDescription>
								<Tran text="server.gamemode-description" />
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="hostCommand"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.host-command" />
							</FormLabel>
							<FormControl>
								<AutosizeTextarea value={field.value || ''} onChange={field.onChange} />
							</FormControl>
							<FormDescription>
								<Tran text="server.host-command-description" />{' '}
								<Tran
									className="font-semibold text-destructive"
									text="server.host-command-warning"
								/>
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="port"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.port" />
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									value={field.value}
									type="number"
									onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
									disabled={!canEditPort}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="image"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.server-version" />
							</FormLabel>
							<FormControl>
								<ComboBox
									className="w-fit"
									required
									value={
										form.watch('image')
											? // eslint-disable-next-line react-hooks/incompatible-library
												SERVER_IMAGES.find((item) => item.image === form.watch('image')) || SERVER_IMAGES[0]!
											: SERVER_IMAGES[SERVER_IMAGES.length - 1]!
									}
									values={SERVER_IMAGES}
									onChange={(value) => {
										form.setValue('image', value.image);
										form.setValue('gameVersion', value.gameVersion);

										field.onChange(value.image);
									}}
									render={({ name }) => (
										<span className="text-sm" key={name}>
											{name}
										</span>
									)}
								/>
							</FormControl>
							<FormDescription>
								<Tran text="server.server-image-description" />
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div
					className={cn('flex w-full gap-2', {
						'sticky bottom-2 right-2': form.formState.isDirty,
					})}
				>
					<Button
						className={cn('ml-auto', {
							'opacity-0': !form.formState.isDirty,
						})}
						type="submit"
						disabled={isPending || !form.formState.isDirty}
					>
						{isPending ? <LoadingSpinner /> : <Tran text="update-server" />}
					</Button>
				</div>
			</form>
		</Form>
	);
}
