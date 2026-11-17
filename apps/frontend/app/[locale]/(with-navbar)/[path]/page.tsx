'use client';

import { PageWrapper } from '@/components/common/page-wrapper';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiInstance } from '@/config/api';
import { SHOW_TAG_NAME_PERSISTENT_KEY, SHOW_TAG_NUMBER_PERSISTENT_KEY } from '@/config/environment';
import { useTagConfig } from '@/hooks/use-tag-config';
import { useSession } from '@/hooks/use-session';
import { useHydrated } from '@/components/common/hydrated';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { paginationQuerySchema, type Session, type UpdateMyUsernameSchema, updateMyUsernameSchema } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Suspense } from 'react';

import { NotificationSettingsTab } from './components/notification-settings-tab';

const SHARE_MY_QUERY_KEY = ['share', 'my'];

export default function Page() {
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsString.withDefault('settings').withOptions({ shallow: true, clearOnDefault: true }),
	);

	const safeTab = tab === 'shares' ? 'shares' : tab === 'notifications' ? 'notifications' : 'settings';

	return (
		<PageWrapper>
			<Tabs value={safeTab} onValueChange={setTab} className="flex h-full flex-col gap-2 overflow-hidden">
				<div className="flex items-center justify-between gap-2">
					<TabsList className="shrink-0">
						<TabsTrigger className="flex-none px-3" value="settings">
							<Tran text="settings" />
						</TabsTrigger>
						<TabsTrigger className="flex-none px-3" value="notifications">
							<Tran text="notification" />
						</TabsTrigger>
						<TabsTrigger className="flex-none px-3" value="shares">
							<Tran text="shared-links" />
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="settings" className="mt-0 flex-1 overflow-auto rounded-md border bg-card/30 p-3">
					<Suspense>
						<SettingsTabContent />
					</Suspense>
				</TabsContent>
				<TabsContent value="notifications" className="mt-0 flex-1 overflow-auto rounded-md border bg-card/30 p-3">
					<Suspense>
						<NotificationSettingsTab />
					</Suspense>
				</TabsContent>
				<TabsContent value="shares" className="mt-0 flex-1 overflow-hidden">
					<Suspense>
						<SharesTabContent />
					</Suspense>
				</TabsContent>
			</Tabs>
		</PageWrapper>
	);
}

function SettingsTabContent() {
	const { showTagName, showTagNumber, setConfig } = useTagConfig();

	return (
		<div className="space-y-3">
			<UsernameSettingSection />
			<div className="rounded-md border bg-background/50 p-3">
				<div className="flex items-center justify-between gap-3">
					<Tran className="text-sm" text="setting.show-tag-name" />
					<Switch
						checked={showTagName}
						onCheckedChange={(value) => setConfig(SHOW_TAG_NAME_PERSISTENT_KEY, value, { path: '/' })}
					/>
				</div>
				<Separator className="my-3" />
				<div className="flex items-center justify-between gap-3">
					<Tran className="text-sm" text="setting.show-tag-number" />
					<Switch
						checked={showTagNumber}
						onCheckedChange={(value) => setConfig(SHOW_TAG_NUMBER_PERSISTENT_KEY, value, { path: '/' })}
					/>
				</div>
			</div>
			<div className="text-xs text-muted-foreground">
				<Tran text="setting.note" />
			</div>
		</div>
	);
}

function UsernameSettingSection() {
	const isHydrated = useHydrated();
	const sessionState = useSession();
	const queryClient = useQueryClient();

	const currentName = sessionState.state === 'authenticated' ? sessionState.session.name : '';

	const form = useForm({
		resolver: zodResolver(updateMyUsernameSchema),
		defaultValues: {
			name: currentName,
		} satisfies UpdateMyUsernameSchema,
	});

	const { mutate, isPending } = useMutation({
		mutationKey: ['update-my-username'],
		mutationFn: (data: UpdateMyUsernameSchema) => apiInstance.request(api.v4.users.me.update, { body: data }),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: (_data, variables) => {
			queryClient.setQueryData<Session | null>(['session'], (old) =>
				old ? { ...old, name: variables.name } : old,
			);
			queryClient.invalidateQueries({ queryKey: ['session'] });
			toast.success(<Tran text="saved" />);
		},
	});

	if (!isHydrated || sessionState.state !== 'authenticated') return null;

	const formKey = `${sessionState.session.id}:${sessionState.session.name}`;

	const onSubmit = (data: UpdateMyUsernameSchema) => {
		if (data.name === currentName) return;
		mutate(data);
	};

	return (
		<div className="rounded-md border bg-background/50 p-3">
			<Form key={formKey} {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Tran text="setting.username" />
								</FormLabel>
								<div className="flex items-center gap-2">
									<FormControl>
										<Input autoComplete="nickname" {...field} />
									</FormControl>
									<Button type="submit" disabled={isPending || field.value === currentName}>
										<Tran text="save" />
									</Button>
								</div>
							</FormItem>
						)}
					/>
					<div className="text-xs text-muted-foreground">
						<Tran text="setting.username-note" />
					</div>
				</form>
			</Form>
		</div>
	);
}

function SharesTabContent() {
	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border bg-card/30">
			<div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
				<Tran text="url" />
				<Tran className="ml-auto" text="count" />
			</div>
			<Separator />
			<div className="scroll-container min-h-0 flex-1 overflow-y-auto p-2">
				<ApiItem
					route={api.v4.share.findMy}
					query={paginationQuerySchema}
					queryKey={SHARE_MY_QUERY_KEY}
					empty={() => (
						<div className="rounded-md border border-dashed bg-background/40 p-6 text-center text-sm text-muted-foreground">
							<Tran text="no-data" />
						</div>
					)}
				>
					{(items) => (
						<div className="space-y-2">
							{items.map((item) => (
								<div className="flex items-center gap-3 rounded-md border bg-background/50 px-3 py-2" key={item.id}>
									<a
										className="min-w-0 flex-1 truncate font-mono text-xs text-foreground hover:underline"
										href={item.url}
										rel="noreferrer"
										target="_blank"
									>
										{item.url}
									</a>
									<span className="shrink-0 rounded-sm bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
										{item.count}
									</span>
								</div>
							))}
						</div>
					)}
				</ApiItem>
			</div>
			<Separator />
			<div className="flex justify-end p-2">
				<ApiPagination queryKey={SHARE_MY_QUERY_KEY} route={api.v4.share.countMy} />
			</div>
		</div>
	);
}
