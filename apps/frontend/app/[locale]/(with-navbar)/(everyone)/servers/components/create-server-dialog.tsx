import type { ApiBody } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createServerSchema } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { SERVER_IMAGES, SERVER_MODES, SERVER_GAMEMODES } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft, HeartIcon, ImageIcon } from 'lucide-react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ComboBox from '@/components/combo-box/combo-box';
import SuggestionInput from '@/components/combo-box/suggestion-input';
import ColorText from '@/components/common/color-text';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import { ApiItem } from '@/components/query/api-item';
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
import { Separator } from '@/components/ui/separator';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { useSession } from '@/hooks/use-session';
import { LocalLink } from '@/components/common/locale-link';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import Link from 'next/link';

const PORT_QUERY_KEY = ['servers', 'port'];
const FREE_TO_USE_SM_QUERY_KEY = ['free-to-use-server-manager'];
const MY_SM_QUERY_KEY = ['my-server-managers'];

const CAN_CREATE_SERVER = true;

export function CreateServerDialog() {
	const form = useForm({
		resolver: zodResolver(createServerSchema),
		defaultValues: {
			name: '',
			description: '',
			mode: 'SURVIVAL',
			port: 0,
			image: SERVER_IMAGES[0]!.image,
			gameVersion: SERVER_IMAGES[0]!.gameVersion,
		},
	});

	const managerId = form.watch('managerId');

	const { data, isFetching } = useQuery({
		queryKey: PORT_QUERY_KEY,
		queryFn: () =>
			managerId
				? apiInstance.request(api.v4.servers.managers.findFreePort, {
						params: {
							id: managerId,
						},
					})
				: Promise.reject(new Error('Manager ID is required')),
		enabled: !!managerId,
	});

	useEffect(() => form.setValue('port', data || 15001), [data, form]);

	const { session } = useSession();
	const [managerType, setManagerType] = useState<'mindustry-tool' | 'my-server' | undefined>(undefined);
	const isManagerOwner = managerType === 'my-server';
	const isAdmin = hasAccess(session, 'server:manage');
	const canEditPort = isAdmin || isManagerOwner;

	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: (body: ApiBody<typeof api.v4.servers.create>) =>
			apiInstance.request(api.v4.servers.create, {
				body,
			}),
		onSuccess: (result) => {
			form.reset();
			router.push(routes.servers.id({ id: result.id }).value);
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: ApiBody<typeof api.v4.servers.create>) {
		mutate(data);
	}

	if (!CAN_CREATE_SERVER) {
		return (
			<div className="grid gap-1">
				<p className="text-xl font-bold">We current out of budget to create new server</p>
				<Link className="underline font-semibold text-pink-400 flex gap-1 items-center" href={routes.donate}>
					<span>Support server</span>
					<HeartIcon className="size-4" />
				</Link>
			</div>
		);
	}

	if (managerId) {
		if (isFetching) {
			return <LoadingSpinner />;
		}

		return (
			<Form {...form}>
				<form className="flex h-full w-full flex-col gap-6 overflow-y-auto" onSubmit={form.handleSubmit(onSubmit)}>
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
										<label
											className="flex h-9 items-center justify-center rounded-md border p-2"
											htmlFor="image"
											hidden
										>
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
									<Tran className="font-semibold text-destructive" text="server.host-command-warning" />
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
						render={({}) => (
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
												: SERVER_IMAGES[1]!
										}
										values={SERVER_IMAGES}
										onChange={(value) => {
											form.setValue('image', value.image);
											form.setValue('gameVersion', value.gameVersion);
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
					<div className="flex w-full gap-2">
						<Button className="ml-auto" variant="outline" onClick={() => form.setValue('managerId', undefined)}>
							<ChevronLeft />
							<Tran text="back" />
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? <LoadingSpinner /> : <Tran text="server.create-server" />}
						</Button>
					</div>
				</form>
			</Form>
		);
	}

	if (managerType === undefined) {
		return (
			<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
				<Button onClick={() => setManagerType('mindustry-tool')}>
					<Tran text="server.create-server-on-mindustry-tool" />
				</Button>
				<Separator />
				<Button onClick={() => setManagerType('my-server')} variant="outline">
					<Tran text="server.create-server-on-my-server" />
				</Button>
			</div>
		);
	}

	if (managerType === 'mindustry-tool') {
		return (
			<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
				<Button className="w-fit" variant="outline" onClick={() => setManagerType(undefined)}>
					<ChevronLeft />
					<Tran text="back" />
				</Button>
				<Separator />
				<div className="flex max-h-[50vh] w-full flex-col overflow-y-auto gap-2">
					<ApiItem
						route={api.v4.servers.managers.getFreeToUseServerManager}
						queryKey={FREE_TO_USE_SM_QUERY_KEY}
						loading={() => <LoadingSpinner />}
					>
						{(items) =>
							items.map(({ id, name, address }) => (
								<Button variant="outline" key={id} onClick={() => form.setValue('managerId', id)}>
									<span className="font-semibold">{name}</span>
									<span className="text-sm text-muted-foreground">({address})</span>
								</Button>
							))
						}
					</ApiItem>
				</div>
			</div>
		);
	}

	if (managerType === 'my-server') {
		return (
			<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
				<Button className="w-fit" variant="outline" onClick={() => setManagerType(undefined)}>
					<ChevronLeft />
					<Tran text="back" />
				</Button>
				<Separator />
				<div className="flex max-h-[50vh] w-full flex-col overflow-y-auto gap-2">
					<ClientProtectedElement filter>
						<ApiItem
							route={api.v4.servers.managers.getMyServerManagers}
							queryKey={MY_SM_QUERY_KEY}
							loading={() => <LoadingSpinner />}
						>
							{(items) =>
								items.map(({ id, name, address }) => (
									<Button variant="outline" key={id} onClick={() => form.setValue('managerId', id)}>
										<span className="font-semibold">{name}</span>
										<span className="text-sm text-muted-foreground">({address})</span>
									</Button>
								))
							}
						</ApiItem>
					</ClientProtectedElement>
					<Button variant="outline" asChild>
						<LocalLink href={routes.serverManagers.create}>
							<span className="font-semibold">
								<Tran text="server.create-server-manager" />
							</span>
						</LocalLink>
					</Button>
				</div>
			</div>
		);
	}

	throw new Error(`Not supported manager type: ${managerType}`);
}
