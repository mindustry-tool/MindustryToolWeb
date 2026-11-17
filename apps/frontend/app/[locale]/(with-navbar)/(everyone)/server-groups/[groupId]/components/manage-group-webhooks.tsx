'use client';

import { ReactNode, useState } from 'react';

import { api } from '@mindustry-tool/api';
import { ApiBody, ApiResult } from '@mindustry-tool/api';
import { createServerGroupWebhookSchema, ServerGroupWebhookDto, updateServerGroupWebhookSchema } from '@mindustry-tool/api';
import { formatWithParameter } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { MutateButton } from '@/components/buttons/mutate-button';
import ComboBox from '@/components/combo-box/combo-box';
import ColorText from '@/components/common/color-text';
import JsonDisplay from '@/components/common/json-display';
import { ApiItem } from '@/components/query/api-item';
import { useWebhookEvents, WebhookCardView } from '@/components/webhooks/webhook-card-view';
import {
	DiscordEmbedPreview,
	parseEmbedJson,
	DiscordEmbed,
} from '@/components/webhooks/discord-embed-preview';
import { EmbedBuilder } from '@/components/webhooks/embed-builder';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormError, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import ScrollContainer from '@/components/common/scroll-container';
import { ServerWebhookSkeleton } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-webhook-card';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export function ManageGroupWebhooks({ groupId, title }: { groupId: string; title?: ReactNode }) {
	return (
		<div className="flex flex-col h-full overflow-hidden gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{title ?? <Tran className="text-xl font-semibold" text="server.webhook" />}
				<Dialog>
					<DialogTrigger asChild>
						<Button className="ml-auto" variant="default" size="sm">
							<Tran text="server.create-webhook" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>
							<Tran text="server.create-webhook" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<CreateWebhookForm groupId={groupId} />
					</DialogContent>
				</Dialog>
			</div>

			<ScrollContainer className="flex-1 gap-3">
				<ApiItem
					queryKey={['server-groups', groupId, 'webhooks']}
					route={api.v4.serverGroups.webhooks.getAll}
					params={{ groupId }}
					loading={() => <ServerWebhookSkeleton />}
					empty={() => (
						<div className="text-center text-muted-foreground py-4">
							<Tran text="server.no-webhooks" />
						</div>
					)}
				>
					{(items) =>
						items.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								<Tran text="server.no-webhooks" />
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{items.map((item) => (
									<WebhookCard key={item.id} groupId={groupId} webhook={item} />
								))}
							</div>
						)
					}
				</ApiItem>
			</ScrollContainer>
		</div>
	);
}

function WebhookCard({
	groupId,
	webhook,
}: {
	groupId: string;
	webhook: ApiResult<typeof api.v4.serverGroups.webhooks.getAll>[number];
}) {
	const { id: webhookId, event, url, data, active } = webhook;
	const queryClient = useQueryClient();

	const { mutate: updateWebhook } = useMutation({
		mutationFn: (newActive: boolean) =>
			apiInstance.request(api.v4.serverGroups.webhooks.update, {
				params: { groupId, webhookId },
				body: { active: newActive },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId, 'webhooks'] });
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	const { data: events } = useWebhookEvents(
		['server-groups', groupId, 'webhooks', 'events'],
		api.v4.servers.webhooks.events.getAll,
		{},
	);
	const selectedEvent = events?.find((item) => item.name === event);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<WebhookCardView
					event={event}
					url={url}
					data={data}
					active={active}
					onActiveChange={(newActive) => updateWebhook(newActive)}
					serverName="Server name"
					selectedEvent={selectedEvent}
				/>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="server.update-webhook" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<UpdateWebhookForm groupId={groupId} webhook={webhook} />
			</DialogContent>
		</Dialog>
	);
}

function convertToEmbed(dataStr?: string): DiscordEmbed {
	const parsed = parseEmbedJson(dataStr);
	if (parsed) return parsed;
	return { description: dataStr || '' };
}

function CreateWebhookForm({ groupId }: { groupId: string }) {
	const queryClient = useQueryClient();
	const form = useForm({
		resolver: zodResolver(createServerGroupWebhookSchema),
		defaultValues: {
			event: 'player-join',
			data: '${data.player.name} joined team ${data.player.team.name}',
		},
	});

	const [mode, setMode] = useState<'chat' | 'embed'>(() =>
		parseEmbedJson(form.getValues('data')) ? 'embed' : 'chat',
	);

	const { data } = useWebhookEvents(
		['server-groups', groupId, 'webhooks', 'events'],
		api.v4.servers.webhooks.events.getAll,
		{},
	);

	const { mutate, isPending } = useMutation({
		mutationFn: (body: ApiBody<typeof api.v4.serverGroups.webhooks.create>) =>
			apiInstance.request(api.v4.serverGroups.webhooks.create, {
				params: {
					groupId,
				},
				body,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId, 'webhooks'] });
			form.reset();
		},
	});

	const events = data || [];
	// eslint-disable-next-line react-hooks/incompatible-library
	const selectedEvent = events.find((item) => item.name === form.watch('event'));
	const watchData = form.watch('data');
	const parsedEmbed = parseEmbedJson(watchData);

	const onSubmit = (data: ApiBody<typeof api.v4.serverGroups.webhooks.create>) => {
		mutate(data);
	};

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormError />
				<FormField
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.webhook-url" />
							</FormLabel>
							<FormControl>
								<Input
									placeholder="https://discord.com/api/webhooks/1438953712688300144/G5tEF-H80FJArngO8uVLLCSSs7nlq3uBwxY3fWCUlEeplI7kIJvZQ3k1YYEa322Pdz8a"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					name="event"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.webhook-event" />
							</FormLabel>
							<FormControl>
								<ComboBox
									value={events.find((item) => item.name === field.value)}
									values={events}
									onChange={(event) => field.onChange(event?.name)}
									render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}
								/>
							</FormControl>
							{selectedEvent && (
								<div className="border rounded-md p-3">
									<Tran
										className="text-sm font-semibold"
										text="server.webhook-example-data"
									/>
									<JsonDisplay className="text-muted-foreground" json={selectedEvent.example} expand />
								</div>
							)}
						</FormItem>
					)}
				/>

				<div className="flex flex-col gap-2">
					<FormLabel>
						<Tran text="server.webhook-data" />
					</FormLabel>
					<Tabs
						value={mode}
						onValueChange={(val) => {
							const newMode = val as 'chat' | 'embed';
							setMode(newMode);
							if (newMode === 'embed') {
								const currentEmbed = convertToEmbed(form.getValues('data'));
								form.setValue('data', JSON.stringify(currentEmbed, null, 2), { shouldDirty: true });
							}
						}}
					>
						<TabsList className="w-full mb-2">
							<TabsTrigger value="chat">Chat Message</TabsTrigger>
							<TabsTrigger value="embed">Embed Builder</TabsTrigger>
						</TabsList>
						<TabsContent value="chat">
							<FormField
								name="data"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<AutosizeTextarea
												minHeight={192}
												value={field.value}
												onChange={(event) => field.onChange(event.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</TabsContent>
						<TabsContent value="embed">
							<FormField
								name="data"
								render={({ field }) => {
									const embedObj = convertToEmbed(field.value);
									return (
										<FormItem>
											<EmbedBuilder
												embed={embedObj}
												onChange={(newEmbed) => {
													field.onChange(JSON.stringify(newEmbed, null, 2));
												}}
											/>
										</FormItem>
									);
								}}
							/>
						</TabsContent>
					</Tabs>

					{/* Live Preview */}
					{selectedEvent && (
						<div className="flex flex-col gap-1.5 pt-2">
							<span className="text-xs font-semibold text-muted-foreground">
								<Tran text="server.webhook-example-data" />
							</span>
							{parsedEmbed ? (
								<DiscordEmbedPreview
									embed={parsedEmbed}
									sampleData={{ ...selectedEvent.example, serverName: 'Server name' }}
								/>
							) : (
								<div className="flex items-start gap-2 bg-secondary/20 border rounded-lg p-3 text-xs">
									<ColorText
										className="whitespace-pre-wrap break-all"
										text={formatWithParameter(watchData || '', 'data', {
											...selectedEvent.example,
											serverName: 'Server name',
										})}
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<Button className="ml-auto" type="submit" disabled={isPending}>
					<Tran text="server.create-webhook" />
				</Button>
			</form>
		</Form>
	);
}

function UpdateWebhookForm({ groupId, webhook }: { groupId: string; webhook: ServerGroupWebhookDto }) {
	const queryClient = useQueryClient();
	const form = useForm({
		resolver: zodResolver(updateServerGroupWebhookSchema),
		values: webhook,
	});

	const [mode, setMode] = useState<'chat' | 'embed'>(() =>
		parseEmbedJson(webhook.data) ? 'embed' : 'chat',
	);

	const { data } = useWebhookEvents(
		['server-groups', groupId, 'webhooks', 'events'],
		api.v4.servers.webhooks.events.getAll,
		{},
	);

	const { mutate, isPending } = useMutation({
		mutationFn: (body: ApiBody<typeof api.v4.serverGroups.webhooks.update>) =>
			apiInstance.request(api.v4.serverGroups.webhooks.update, {
				params: {
					groupId,
					webhookId: webhook.id,
				},
				body,
			}),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId, 'webhooks'] });
			form.reset();
			form.reset(data);
			toast.success(<Tran text="server.webhook-updated" />);
		},
	});

	const events = data || [];
	// eslint-disable-next-line react-hooks/incompatible-library
	const selectedEvent = events.find((item) => item.name === form.watch('event'));
	const watchData = form.watch('data');
	const parsedEmbed = parseEmbedJson(watchData);

	const onSubmit = (data: ApiBody<typeof api.v4.serverGroups.webhooks.update>) => {
		mutate(data);
	};

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormError />
				<FormField
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.webhook-url" />
							</FormLabel>
							<FormControl>
								<Input
									placeholder="https://discord.com/api/webhooks/1438953712688300144/G5tEF-H80FJArngO8uVLLCSSs7nlq3uBwxY3fWCUlEeplI7kIJvZQ3k1YYEa322Pdz8a"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					name="event"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.webhook-event" />
							</FormLabel>
							<FormControl>
								<ComboBox
									value={events.find((item) => item.name === field.value)}
									values={events}
									onChange={(event) => field.onChange(event?.name)}
									render={(item) => (item ? <span>{item.name}</span> : <Tran text="select" />)}
								/>
							</FormControl>
							{selectedEvent && (
								<div className="border rounded-md p-3">
									<Tran
										className="text-sm font-semibold"
										text="server.webhook-example-data"
									/>
									<JsonDisplay className="text-muted-foreground" json={selectedEvent.example} expand />
								</div>
							)}
						</FormItem>
					)}
				/>

				<div className="flex flex-col gap-2">
					<FormLabel>
						<Tran text="server.webhook-data" />
					</FormLabel>
					<Tabs
						value={mode}
						onValueChange={(val) => {
							const newMode = val as 'chat' | 'embed';
							setMode(newMode);
							if (newMode === 'embed') {
								const currentEmbed = convertToEmbed(form.getValues('data'));
								form.setValue('data', JSON.stringify(currentEmbed, null, 2), { shouldDirty: true });
							}
						}}
					>
						<TabsList className="w-full mb-2">
							<TabsTrigger value="chat">Chat Message</TabsTrigger>
							<TabsTrigger value="embed">Embed Builder</TabsTrigger>
						</TabsList>
						<TabsContent value="chat">
							<FormField
								name="data"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<AutosizeTextarea
												minHeight={192}
												value={field.value}
												onChange={(event) => field.onChange(event.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</TabsContent>
						<TabsContent value="embed">
							<FormField
								name="data"
								render={({ field }) => {
									const embedObj = convertToEmbed(field.value);
									return (
										<FormItem>
											<EmbedBuilder
												embed={embedObj}
												onChange={(newEmbed) => {
													field.onChange(JSON.stringify(newEmbed, null, 2));
												}}
											/>
										</FormItem>
									);
								}}
							/>
						</TabsContent>
					</Tabs>

					{/* Live Preview */}
					{selectedEvent && (
						<div className="flex flex-col gap-1.5 pt-2">
							<span className="text-xs font-semibold text-muted-foreground">
								<Tran text="server.webhook-example-data" />
							</span>
							{parsedEmbed ? (
								<DiscordEmbedPreview
									embed={parsedEmbed}
									sampleData={{ ...selectedEvent.example, serverName: 'Server name' }}
								/>
							) : (
								<div className="flex items-start gap-2 bg-secondary/20 border rounded-lg p-3 text-xs">
									<ColorText
										className="whitespace-pre-wrap break-all"
										text={formatWithParameter(watchData || '', 'data', {
											...selectedEvent.example,
											serverName: 'Server name',
										})}
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex gap-2 justify-end">
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								<Tran text="server.delete-webhook" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle>
								<Tran text="server.delete-webhook" />
							</AlertDialogTitle>
							<VisuallyHidden>
								<AlertDialogDescription />
							</VisuallyHidden>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<Tran text="cancel" />
								</AlertDialogCancel>
								<MutateButton
									variant="destructive"
									queryKey={['server-groups', groupId, 'webhooks']}
									mutationKey={['server-groups', groupId, 'webhooks']}
									mutationFn={() =>
										apiInstance.request(api.v4.serverGroups.webhooks.delete, {
											params: {
												groupId,
												webhookId: webhook.id,
											},
										})
									}
								>
									<Tran text="server.delete-webhook" />
								</MutateButton>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<Button type="submit" disabled={isPending || !form.formState.isDirty}>
						<Tran text="server.update-webhook" />
					</Button>
				</div>
			</form>
		</Form>
	);
}
