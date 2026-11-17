'use client';

import { api } from '@mindustry-tool/api';
import { countContentPatchSchema, queryContentPatchSchema } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Suspense, useState } from 'react';

import { DownloadButton } from '@/components/buttons/download-button';
import { LikeButton } from '@/components/buttons/like-button';
import {
	PreviewContainer,
	PreviewContainerContent,
	PreviewContainerFooter,
	PreviewContainerHeader,
} from '@/components/common/preview';
import { ContentPatchPreviewCard } from '@/components/content-patch/content-patch-preview-card';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];

const UploadContentPatchDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(everyone)/content-patches/components/upload-content-patch-dialog'),
);

export default function Page() {
	return (
		<PreviewContainer>
			<PreviewContainerHeader>
				<SearchBar tags="content-patches" sorts={SORT_TAGS} author size />
			</PreviewContainerHeader>
			<PreviewContainerContent>
				<ApiItem
					route={api.v4.contentPatches.getAll}
					queryKey={CONTENT_PATCHES_QUERY_KEY}
					query={[queryContentPatchSchema, { verification: 'VERIFIED' }]}
				>
					{(items) =>
						items.map((item) => (
							<ContentPatchPreviewCard key={item.id} data={item}>
								<LikeButton itemType="content-patches" data={item} variant="outline" />
								<DownloadButton itemType="content-patches" queryKey={CONTENT_PATCHES_QUERY_KEY} data={item} />
							</ContentPatchPreviewCard>
						))
					}
				</ApiItem>
			</PreviewContainerContent>
			<PreviewContainerFooter>
				<UploadContentPatchButton />
				<ApiPagination
					route={api.v4.contentPatches.count}
					queryKey={CONTENT_PATCHES_QUERY_KEY}
					query={[countContentPatchSchema, { verification: 'VERIFIED' }]}
				/>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}

function UploadContentPatchButton() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Upload />
					<Tran text="upload" />
				</Button>
			</DialogTrigger>
			<Suspense>
				<DialogContent className="max-h-[80dvh] overflow-hidden flex flex-col">
					<DialogTitle>
						<Tran text="upload.content-patch" />
					</DialogTitle>
					<VisuallyHidden>
						<DialogDescription />
					</VisuallyHidden>
					<UploadContentPatchDialog onSuccess={() => setOpen(false)} />
				</DialogContent>
			</Suspense>
		</Dialog>
	);
}
