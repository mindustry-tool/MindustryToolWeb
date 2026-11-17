'use client';
import { api } from '@mindustry-tool/api';
import { ApiResult, ExtractActionValue } from '@mindustry-tool/api';
import { countActionQuerySchema, getActionQuerySchema } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { ReactNode, Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import ComboBox from '@/components/combo-box/combo-box';
import JsonDisplay from '@/components/common/json-display';
import { RelativeTime } from '@/components/common/relative-time';
import { SearchInput } from '@/components/common/search-input';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar, UserComponent, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { cn, getColor, TEXT_COLORS } from '@/lib/utils';
import ScrollContainer from '@/components/common/scroll-container';
import { PageWrapper } from '@/components/common/page-wrapper';
import { Item, ItemDescription } from '@/components/common/item';
import ProtectedRoute from '@/components/layout/protected-route';

const VerifyVerifyAction = dynamic(() => import('./components/verify-verify-action'));
const VerifyRejectAction = dynamic(() => import('./components/verify-reject-action'));
const VerifyResetAction = dynamic(() => import('./components/verify-reset-action'));
const UserMeUpdateAction = dynamic(() => import('./components/user-me-update-action'));
const UserCreateAction = dynamic(() => import('./components/user-create-action'));
const UserUpdateAction = dynamic(() => import('./components/user-update-action'));
const UserRolesUpdateAction = dynamic(() => import('./components/user-roles-update-action'));
const UserBanAction = dynamic(() => import('./components/user-ban-action'));
const IconCreateAction = dynamic(() => import('./components/icon-create-action'));
const IconUpdateAction = dynamic(() => import('./components/icon-update-action'));
const IconDeleteAction = dynamic(() => import('./components/icon-delete-action'));
const WikiCreateAction = dynamic(() => import('./components/wiki-create-action'));
const WikiUpdateAction = dynamic(() => import('./components/wiki-update-action'));
const WikiDeleteAction = dynamic(() => import('./components/wiki-delete-action'));
const WikiLinkAction = dynamic(() => import('./components/wiki-link-action'));
const WikiLinkRemoveAction = dynamic(() => import('./components/wiki-link-remove-action'));
const LikeCreateAction = dynamic(() => import('./components/like-create-action'));
const TagCreateAction = dynamic(() => import('./components/tag-create-action'));
const TagUpdateAction = dynamic(() => import('./components/tag-update-action'));
const TagDeleteAction = dynamic(() => import('./components/tag-delete-action'));
const TagCategoryCreateAction = dynamic(() => import('./components/tag-category-create-action'));
const TagCategoryUpdateAction = dynamic(() => import('./components/tag-category-update-action'));
const TagCategoryDeleteAction = dynamic(() => import('./components/tag-category-delete-action'));
const TagGroupCreateAction = dynamic(() => import('./components/tag-group-create-action'));
const TagGroupDeleteAction = dynamic(() => import('./components/tag-group-delete-action'));
const PlanetCreateAction = dynamic(() => import('./components/planet-create-action'));
const PlanetUpdateAction = dynamic(() => import('./components/planet-update-action'));
const PlanetDeleteAction = dynamic(() => import('./components/planet-delete-action'));
const SchematicPreviewAction = dynamic(() => import('./components/schematic-preview-action'));
const SchematicImageAction = dynamic(() => import('./components/schematic-image-action'));
const SchematicCreateAction = dynamic(() => import('./components/schematic-create-action'));
const MapPreviewAction = dynamic(() => import('./components/map-preview-action'));
const MapImageAction = dynamic(() => import('./components/map-image-action'));
const MapCreateAction = dynamic(() => import('./components/map-create-action'));
const UploadCreateAction = dynamic(() => import('./components/upload-create-action'));
const UploadUpdateAction = dynamic(() => import('./components/upload-update-action'));
const UploadDeleteAction = dynamic(() => import('./components/upload-delete-action'));
const RoleCreateAction = dynamic(() => import('./components/role-create-action'));
const RoleUpdateAction = dynamic(() => import('./components/role-update-action'));
const RoleDeleteAction = dynamic(() => import('./components/role-delete-action'));
const ServerCreateAction = dynamic(() => import('./components/server-create-action'));
const ServerUpdateAction = dynamic(() => import('./components/server-update-action'));
const ServerAdminUpdateAction = dynamic(() => import('./components/server-admin-update-action'));
const ServerHostAction = dynamic(() => import('./components/server-host-action'));
const ServerHostServerAction = dynamic(() => import('./components/server-host-server-action'));
const ServerCommandAction = dynamic(() => import('./components/server-command-action'));
const ServerRemoveAction = dynamic(() => import('./components/server-remove-action'));
const ServerDeleteAction = dynamic(() => import('./components/server-delete-action'));
const ServerWebhookCreateAction = dynamic(() => import('./components/server-webhook-create-action'));
const ServerWebhookUpdateAction = dynamic(() => import('./components/server-webhook-update-action'));
const ServerWebhookDeleteAction = dynamic(() => import('./components/server-webhook-delete-action'));
const ServerAdminDeleteAction = dynamic(() => import('./components/server-admin-delete-action'));
const ServerFileCreateAction = dynamic(() => import('./components/server-file-create-action'));
const ServerFileDeleteAction = dynamic(() => import('./components/server-file-delete-action'));
const ServerFolderCreateAction = dynamic(() => import('./components/server-folder-create-action'));
const ServerFileWriteAction = dynamic(() => import('./components/server-file-write-action'));
const ServerCreditTransferAction = dynamic(() => import('./components/server-credit-transfer-action'));
const ServerManagerCreateAction = dynamic(() => import('./components/server-manager-create-action'));
const ServerManagerResetAction = dynamic(() => import('./components/server-manager-reset-action'));
const DownloadAction = dynamic(() => import('./components/download-action'));
const ServerContentPatchCreateAction = dynamic(() => import('./components/server-content-patch-create-action'));
const ShareLinkCreateAction = dynamic(() => import('./components/share-link-create-action'));
const ShareLinkVisitAction = dynamic(() => import('./components/share-link-visit-action'));
const LogicCreateAction = dynamic(() => import('./components/logic-create-action'));

const ACTIONS_QUERY_KEY = ['actions'];
const AUTHORS_QUERY_KEY = ['authors'];

export default function Page() {
	return (
		<ProtectedRoute filter="god">
			<PageWrapper>
				<Tran className="text-2xl font-semibold" text="moderation.action" />
				<Separator />
				<Suspense>
					<ScrollContainer>
						<Filter />
						<ApiItem
							queryKey={ACTIONS_QUERY_KEY}
							route={api.v4.actions.get}
							query={getActionQuerySchema}
							loading={() => (
								<Skeletons>
									<Skeleton className="h-21.5 min-h-21.5 border" />
								</Skeletons>
							)}
						>
							{(items) => items.map((action) => <ActionValueCard key={action.id} action={action} />)}
						</ApiItem>
					</ScrollContainer>
				</Suspense>
				<Separator />
				<Suspense>
					<ApiPagination
						className="ml-auto"
						route={api.v4.actions.count}
						queryKey={ACTIONS_QUERY_KEY}
						query={countActionQuerySchema}
					/>
				</Suspense>
			</PageWrapper>
		</ProtectedRoute>
	);
}

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type Api = UnionToIntersection<ExtractActionValue<typeof api>>;

const actionMap: { [K in keyof Api]?: (value: Api[K]) => ReactNode } = {
	'verify.verify': (value) => <VerifyVerifyAction metadata={value} />,
	'verify.reject': (value) => <VerifyRejectAction metadata={value} />,
	'verify.reset': (value) => <VerifyResetAction metadata={value} />,
	'user.me.update': (value) => <UserMeUpdateAction metadata={value} />,
	'user.create': (value) => <UserCreateAction metadata={value} />,
	'user.update': (value) => <UserUpdateAction metadata={value} />,
	'user.roles.update': (value) => <UserRolesUpdateAction metadata={value} />,
	'user.ban': (value) => <UserBanAction metadata={value} />,
	'icon.create': (value) => <IconCreateAction metadata={value} />,
	'icon.update': (value) => <IconUpdateAction metadata={value} />,
	'icon.delete': (value) => <IconDeleteAction metadata={value} />,
	'wiki.create': (value) => <WikiCreateAction metadata={value} />,
	'wiki.update': (value) => <WikiUpdateAction metadata={value} />,
	'wiki.delete': (value) => <WikiDeleteAction metadata={value} />,
	'wiki.link': (value) => <WikiLinkAction metadata={value} />,
	'wiki.link.remove': (value) => <WikiLinkRemoveAction metadata={value} />,
	'like.create': (value) => <LikeCreateAction metadata={value} />,
	'tag.create': (value) => <TagCreateAction metadata={value} />,
	'tag.update': (value) => <TagUpdateAction metadata={value} />,
	'tag.delete': (value) => <TagDeleteAction metadata={value} />,
	'tag.category.create': (value) => <TagCategoryCreateAction metadata={value} />,
	'tag.category.update': (value) => <TagCategoryUpdateAction metadata={value} />,
	'tag.category.delete': (value) => <TagCategoryDeleteAction metadata={value} />,
	'tag.group.create': (value) => <TagGroupCreateAction metadata={value} />,
	'tag.group.delete': (value) => <TagGroupDeleteAction metadata={value} />,
	'planet.create': (value) => <PlanetCreateAction metadata={value} />,
	'planet.update': (value) => <PlanetUpdateAction metadata={value} />,
	'planet.delete': (value) => <PlanetDeleteAction metadata={value} />,
	'schematic.preview': (value) => <SchematicPreviewAction metadata={value} />,
	'schematic.image': (value) => <SchematicImageAction metadata={value} />,
	'schematic.create': (value) => <SchematicCreateAction metadata={value} />,
	'map.preview': (value) => <MapPreviewAction metadata={value} />,
	'map.image': (value) => <MapImageAction metadata={value} />,
	'map.create': (value) => <MapCreateAction metadata={value} />,
	'upload.create': (value) => <UploadCreateAction metadata={value} />,
	'upload.update': (value) => <UploadUpdateAction metadata={value} />,
	'upload.delete': (value) => <UploadDeleteAction metadata={value} />,
	'role.create': (value) => <RoleCreateAction metadata={value} />,
	'role.update': (value) => <RoleUpdateAction metadata={value} />,
	'role.delete': (value) => <RoleDeleteAction metadata={value} />,
	'server.create': (value) => <ServerCreateAction metadata={value} />,
	'server.update': (value) => <ServerUpdateAction metadata={value} />,
	'server.admin.update': (value) => <ServerAdminUpdateAction metadata={value} />,
	'server.host': (value) => <ServerHostAction metadata={value} />,
	'server.host-server': (value) => <ServerHostServerAction metadata={value} />,
	'server.command': (value) => <ServerCommandAction metadata={value} />,
	'server.remove': (value) => <ServerRemoveAction metadata={value} />,
	'server.delete': (value) => <ServerDeleteAction metadata={value} />,
	'server.webhook.create': (value) => <ServerWebhookCreateAction metadata={value} />,
	'server.webhook.update': (value) => <ServerWebhookUpdateAction metadata={value} />,
	'server.webhook.delete': (value) => <ServerWebhookDeleteAction metadata={value} />,
	'server.admin.delete': (value) => <ServerAdminDeleteAction metadata={value} />,
	'server.file.create': (value) => <ServerFileCreateAction metadata={value} />,
	'server.file.delete': (value) => <ServerFileDeleteAction metadata={value} />,
	'server.folder.create': (value) => <ServerFolderCreateAction metadata={value} />,
	'server.file.write': (value) => <ServerFileWriteAction metadata={value} />,
	'server.credit.transfer': (value) => <ServerCreditTransferAction metadata={value} />,
	'server.manager.create': (value) => <ServerManagerCreateAction metadata={value} />,
	'server.manager.reset': (value) => <ServerManagerResetAction metadata={value} />,
	'download': (value) => <DownloadAction metadata={value} />,
	'server.content-patch.create': (value) => <ServerContentPatchCreateAction metadata={value} />,
	'share-link.create': (value) => <ShareLinkCreateAction metadata={value} />,
	'share-link.visit': (value) => <ShareLinkVisitAction metadata={value} />,
	'logic.create': (value) => <LogicCreateAction metadata={value} />,
};

function ActionValueCard({ action }: { action: ApiResult<typeof api.v4.actions.get>[number] }) {
	const { id, name, metadata, triggeredAt, triggeredBy } = action;

	const render = actionMap[name as keyof Api];

	const nameSegments = name.split('.');

	return (
		<Item key={id}>
			<UserWithIdComponent userId={triggeredBy}>
				<div className="flex items-center gap-2">
					<UserAvatar />
					<div className="flex flex-col">
						<div className="flex gap-1">
							<span className="font-semibold uppercase">
								{nameSegments.map((segment, index) => (
									<span key={index} className={getColor(segment, TEXT_COLORS)}>
										{segment}
										{index < nameSegments.length - 1 && '.'}
									</span>
								))}
							</span>
							<span>by</span>
							<UserName />
						</div>
						<RelativeTime date={new Date(triggeredAt)} />
					</div>
				</div>
			</UserWithIdComponent>
			<ItemDescription>{render ? render(metadata) : <JsonDisplay json={metadata} />}</ItemDescription>
		</Item>
	);
}

function Filter() {
	const [action, setAction] = useQueryState('action');

	const { data } = useQuery({
		queryKey: ['actionTypes'],
		queryFn: () => apiInstance.request(api.v4.actions.getTypes, {}),
	});

	return (
		<div className="flex flex-wrap gap-2">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<Tran text="select-user" />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>
						<Tran text="select-user" />
					</DialogTitle>
					<VisuallyHidden>
						<DialogDescription />
					</VisuallyHidden>
					<SelectUserDialog />
				</DialogContent>
			</Dialog>
			<ComboBox value={action || undefined} values={data || []} onChange={(value) => setAction(value || null)} />
		</div>
	);
}

function SelectUserDialog() {
	const [triggeredBy, setTriggeredBy] = useQueryState('triggeredBy');
	const [input, setInput] = useState('');
	const { t } = useI18n('moderation');

	return (
		<div className="space-y-2">
			<SearchInput className="w-full max-w-none" value={input} onChange={setInput} placeholder={t('moderation.search-user')} />
			<Separator />
			<div className="grid gap-1">
				<ApiItem
					route={api.v4.users.search}
					queryKey={AUTHORS_QUERY_KEY}
					query={{
						q: input,
					}}
					loading={() => <LoadingSpinner />}
				>
					{(data) =>
						data?.map((item) => (
							<button
								key={item.id}
								className={cn(
									'w-full justify-start bg-card rounded-md items-center p-1 inline-flex border cursor-pointer hover:bg-primary hover:text-primary-foreground',
									{
										'bg-primary text-primary-foreground': item.id === triggeredBy,
									},
								)}
								onClick={() => {
									if (item.id === triggeredBy) {
										setTriggeredBy(null);
									} else {
										setTriggeredBy(item.id);
									}
								}}
							>
								<UserComponent data={item} clickable={false}>
									<UserAvatar />
									<UserName />
								</UserComponent>
							</button>
						))
					}
				</ApiItem>
			</div>
		</div>
	);
}
