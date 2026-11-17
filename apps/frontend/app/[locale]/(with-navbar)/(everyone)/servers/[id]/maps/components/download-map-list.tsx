'use client';

import type { MapDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { countMapSchema, mapQuerySchema } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { AlertDialogDescription, AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { ArrowDownToLine } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LikeButton } from '@/components/buttons/like-button';
import { MutateButton } from '@/components/buttons/mutate-button';
import ColorText from '@/components/common/color-text';
import { CommentButton, PreviewContainer, PreviewContainerContent, PreviewSkeleton } from '@/components/common/preview';
import { Skeletons } from '@/components/common/skeletons';
import { MapPreviewCard } from '@/components/map/map-preview-card';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { SearchBar } from '@/components/search-bar/search-bar';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiInstance } from '@/config/api';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';

const MAPS_QUERY_KEY = ['maps'];

export default function DownloadMapList() {
	const { id } = useParams<{ id: string }>();

	return (
		<PreviewContainer className="p-0">
			<Suspense>
				<SearchBar tags="maps" sorts={SORT_TAGS} author size />
				<PreviewContainerContent >
					<ApiItem
						route={api.v4.maps.findAll}
						queryKey={MAPS_QUERY_KEY}
						query={[mapQuerySchema, { verification: 'VERIFIED' }]}
						loading={() => (
							<Skeletons>
								<PreviewSkeleton items={3} />
							</Skeletons>
						)}
					>
						{(items) =>
							items.map((item) => (
								<MapPreviewCard key={item.id} data={item}>
									<LikeButton itemType="maps" data={item} variant="outline" />
									<CommentButton itemType="maps" data={item} />
									<InstallMapButton serverId={id} data={item} />
								</MapPreviewCard>
							))
						}
					</ApiItem>
				</PreviewContainerContent>
				<Separator className="mt-auto" />
				<ApiPagination
					className="ml-auto"
					queryKey={MAPS_QUERY_KEY}
					route={api.v4.maps.count}
					query={[countMapSchema, { verification: 'VERIFIED' }]}
				/>
			</Suspense>
		</PreviewContainer>
	);
}

function InstallMapButton({ serverId, data }: { serverId: string; data: MapDto }) {
	const [open, setOpen] = useState(false);
	const serverMapsKey = useMemo(() => ['servers', serverId, 'maps'], [serverId]);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="outline">
					<ArrowDownToLine />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="map.install" />
				</AlertDialogTitle>
				<AlertDialogDescription>
					<ColorText text={data.name} />
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<MutateButton
							queryKey={serverMapsKey}
							mutationKey={serverMapsKey}
							mutationFn={() =>
								apiInstance.request(api.v4.servers.files.install, {
									params: {
										id: serverId,
									},
									body: {
										url: `${environment.url.apiV4}/maps/${data.itemId}/data`,
										path: `maps/${data.id}.msav`,
									},
								})
							}
							on={{
								onSuccess: () => {
									toast.success(<Tran text="map.installed" />, {
										description: data.name,
									});
									setOpen(false);
								},
							}}
						>
							<ArrowDownToLine />
							<Tran text="map.install" />
						</MutateButton>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
