'use client';

import { api } from '@mindustry-tool/api';
import { countMapSchema, mapQuerySchema } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

import { DownloadButton } from '@/components/buttons/download-button';
import { LikeButton } from '@/components/buttons/like-button';
import {
	CommentButton,
	PreviewContainer,
	PreviewContainerContent,
	PreviewContainerFooter,
	PreviewContainerHeader,
	PreviewSkeleton,
} from '@/components/common/preview';
import { Skeletons } from '@/components/common/skeletons';
import { MapPreviewCard } from '@/components/map/map-preview-card';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { VirtualizedGrid } from '@/components/common/virtualized-grid';

const MAPS_QUERY_KEY = ['maps'];

const UploadMapDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(everyone)/maps/components/upload-map-dialog'),
);

export function PageClient() {
	return (
		<PreviewContainer>
			<PreviewContainerHeader>
				<SearchBar tags="maps" sorts={SORT_TAGS} author size />
			</PreviewContainerHeader>
			<ApiItem
				route={api.v4.maps.findAll}
				queryKey={MAPS_QUERY_KEY}
				query={[mapQuerySchema, { verification: 'VERIFIED' }]}
				loading={() => (
					<PreviewContainerContent>
						<Skeletons>
							<PreviewSkeleton items={3} />
						</Skeletons>
					</PreviewContainerContent>
				)}
			>
				{(items) => (
					<VirtualizedGrid items={items} getItemHeight={(props) => props.width + 44}>
						{({ item }) => (
							<MapPreviewCard key={item.id} data={item}>
								<LikeButton itemType="maps" data={item} variant="outline" />
								<CommentButton itemType="maps" data={item} />
								<DownloadButton itemType="maps" queryKey={MAPS_QUERY_KEY} data={item} />
							</MapPreviewCard>
						)}
					</VirtualizedGrid>
				)}
			</ApiItem>
			<PreviewContainerFooter>
				<UploadMapButton />
				<ApiPagination
					route={api.v4.maps.count}
					queryKey={MAPS_QUERY_KEY}
					query={[countMapSchema, { verification: 'VERIFIED' }]}
				/>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}

function UploadMapButton() {
	const [open, setOpen] = useQueryState('upload', parseAsBoolean.withDefault(false));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Upload />
					<Tran text="upload" />
				</Button>
			</DialogTrigger>
			<Suspense>
				<DialogContent className="max-h-dvh overflow-y-auto sm:max-w-lg">
					<DialogHeader className="gap-0.5 pb-1">
						<DialogTitle className="text-base font-semibold">
							<Tran text="upload.map" />
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Import a .msav sector map or save file.
						</DialogDescription>
					</DialogHeader>
					<UploadMapDialog />
				</DialogContent>
			</Suspense>
		</Dialog>
	);
}
