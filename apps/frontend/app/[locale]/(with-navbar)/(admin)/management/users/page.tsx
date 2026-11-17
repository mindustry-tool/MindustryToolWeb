'use client';

import { api } from '@mindustry-tool/api';
import { queryAllUserSchema, UserDto } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Edit, HammerIcon, Plus } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';

import CreateUserForm from '@/app/[locale]/(with-navbar)/(admin)/management/users/components/create-user-form';
import UpdateUserForm from '@/app/[locale]/(with-navbar)/(admin)/management/users/components/update-user-form';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import { CatchError } from '@/components/error/catch-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { UserComponent, UserWithAvatarAndName } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { Input } from '@/components/ui/input';
import ComboBox from '@/components/combo-box/combo-box';
import ScrollContainer from '@/components/common/scroll-container';
import { PageFooter, PageHeader, PageWrapper } from '@/components/common/page-wrapper';
import { Item } from '@/components/common/item';
import ProtectedRoute from '@/components/layout/protected-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsTab } from '@/app/[locale]/(with-navbar)/(admin)/management/users/components/analytics-tab';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MutateButton } from '@/components/buttons/mutate-button';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const USERS_MANAGEMENT_QUERY_KEY = ['users', 'management'];
const ROLES_QUERY_KEY = ['roles'];

export default function Page() {
	return (
		<ProtectedRoute filter="user:manage">
			<PageWrapper>
				<Tabs defaultValue="users" className="flex flex-col flex-1 overflow-hidden">
					<div className="flex items-center justify-between">
						<TabsList>
							<TabsTrigger value="users" className="text-xs">
								<Tran text="users" />
							</TabsTrigger>
							<TabsTrigger value="analytics" className="text-xs">
								<Tran text="user.analytics" />
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent value="users" className="flex flex-col flex-1 overflow-hidden gap-2">
						<Suspense>
							<SearchBar />
							<Separator />
							<ScrollContainer>
								<InfiniteApiItem
									className="space-y-4"
									route={api.v4.users.findAll}
									queryKey={USERS_MANAGEMENT_QUERY_KEY}
									query={queryAllUserSchema}
								>
									{(items) =>
										items &&
										Object.entries(
											Object.groupBy(
												items.flatMap((item) => item),
												(item) => new Date(item.createdAt).toLocaleDateString(),
											),
										).map(([date, group]) => (
											<section key={date} className="space-y-1">
												<div className="flex items-center gap-2 py-0.5">
													<Badge
														variant="secondary"
														className="flex size-5 items-center justify-center rounded-full p-0 text-[11px] tabular-nums"
													>
														{group?.length}
													</Badge>
													<span className="text-xs text-muted-foreground">{date}</span>
													<div className="h-px flex-1 bg-border/50" />
												</div>
												{group?.map((user) => (
													<UserComponent key={user.id} data={user}>
														<Item
															className={cn(
																'flex-row items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/40',
																{
																	'border-l-2 border-l-destructive bg-destructive/4': !!user.bannedUntil,
																},
															)}
														>
															<UserWithAvatarAndName />
															<EllipsisButton className="ml-auto" variant="ghost">
																<Dialog>
																	<DialogTrigger asChild>
																		<Button variant="command" className="justify-between">
																			<Tran text="edit" />
																			<Edit />
																		</Button>
																	</DialogTrigger>
																	<DialogContent>
																		<DialogTitle>
																			<Tran text="edit" />
																		</DialogTitle>
																		<VisuallyHidden>
																			<DialogDescription />
																		</VisuallyHidden>
																		<CatchError>
																			<UpdateUserForm user={user} />
																		</CatchError>
																	</DialogContent>
																</Dialog>
																<AlertDialog>
																	<AlertDialogTrigger asChild>
																		<Button variant="destructive" className="justify-between">
																			<Tran text="ban" />
																			<HammerIcon />
																		</Button>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<BanDialog user={user} />
																	</AlertDialogContent>
																</AlertDialog>
															</EllipsisButton>
														</Item>
													</UserComponent>
												))}
											</section>
										))
									}
								</InfiniteApiItem>
							</ScrollContainer>
							<Separator className="mt-auto" />
							<PageFooter>
								<Dialog>
									<DialogTrigger asChild>
										<Button>
											<Plus />
											<Tran text="add" />
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogTitle>
											<Tran text="add" />
										</DialogTitle>
										<VisuallyHidden>
											<DialogDescription />
										</VisuallyHidden>
										<CreateUserForm />
									</DialogContent>
								</Dialog>
							</PageFooter>
						</Suspense>
					</TabsContent>
					<TabsContent value="analytics" className="flex flex-col flex-1 overflow-hidden">
						<AnalyticsTab />
					</TabsContent>
				</Tabs>
			</PageWrapper>
		</ProtectedRoute>
	);
}

function SearchBar() {
	const { t } = useI18n('moderation');
	const [role, setRole] = useQueryState('role', {
		clearOnDefault: true,
		defaultValue: '',
	});

	const [name, setName] = useQueryState('name', {
		clearOnDefault: true,
		defaultValue: '',
	});

	const { data } = useQuery({
		queryKey: ROLES_QUERY_KEY,
		queryFn: () => apiInstance.request(api.v4.roles.findAll, {}),
	});

	const roles = useMemo(
		() => (data ? data.filter((role) => !!role.members).sort((a, b) => b.level - a.level) : []),
		[data],
	);
	const selectedRole = roles.find((item) => item.id === role);

	return (
		<PageHeader>
			<Input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder={t('moderation.search-by-name')} />
			<ComboBox
				value={selectedRole}
				values={roles}
				render={(role) =>
					role ? (
						<span style={{ color: role.color || undefined }}>
							{role.id} {!!role.members && <span>({role.members})</span>}
						</span>
					) : (
						''
					)
				}
				onChange={(role) => setRole(role?.id || '')}
			/>
		</PageHeader>
	);
}

const units = ['year', 'month', 'day', 'hour', 'minute'] as const;
type Unit = (typeof units)[number];

const unitToMilis: Record<Unit, number> = {
	year: 365 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
};

function BanDialog({ user }: { user: UserDto }) {
	const { t } = useI18n('moderation');
	const [number, setNumber] = useState(1);
	const [value, setValue] = useState<Unit>('year');

	return (
		<>
			<AlertDialogTitle>
				<Tran text="ban" />
			</AlertDialogTitle>
			<VisuallyHidden>
				<AlertDialogDescription />
			</VisuallyHidden>
			<p className={user.bannedUntil ? 'text-red-500' : 'text-emerald-500'}>
				{user.bannedUntil ? t('banned-until', { date: user.bannedUntil.toLocaleString() }) : t('not-banned')}
			</p>
			<div className="grid grid-cols-[4rem_1fr] items-center gap-x-3 gap-y-2">
				<span className="text-sm text-muted-foreground"><Tran text="moderation.duration" /></span>
				<Input
					type="number"
					value={Number.isNaN(number) ? 1 : number}
					min={1}
					onChange={(event) => setNumber(event.currentTarget.valueAsNumber)}
				/>
				<span className="text-sm text-muted-foreground"><Tran text="moderation.period" /></span>
				<ComboBox
					value={value}
					required
					onChange={(value) => setValue(value as Unit)}
					values={units}
					render={(value) => <span key={value}>{value}</span>}
				/>
			</div>
			<AlertDialogCancel>
				<Tran text="cancel" />
			</AlertDialogCancel>
			<AlertDialogAction asChild>
				<MutateButton
					mutationFn={async () =>
						await apiInstance.request(api.v4.users.ban, {
							params: { id: user.id },
							body: { bannedUntil: new Date(Date.now() + number * unitToMilis[value]) },
						})
					}
					mutationKey={USERS_MANAGEMENT_QUERY_KEY}
					queryKey={USERS_MANAGEMENT_QUERY_KEY}
					variant="destructive"
				>
					<Tran text="ban" />
				</MutateButton>
			</AlertDialogAction>
		</>
	);
}
