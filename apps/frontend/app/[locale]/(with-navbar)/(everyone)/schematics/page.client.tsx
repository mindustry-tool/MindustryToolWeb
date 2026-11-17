'use client';

import { api } from '@mindustry-tool/api';
import { countSchematicSchema, schematicQuerySchema } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { Upload } from 'lucide-react';

import { Suspense } from 'react';

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
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { SchematicCopyButton } from '@/components/schematic/schematic-copy-button';
import { SchematicPreviewCard } from '@/components/schematic/schematic-preview-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { parseAsBoolean, useQueryState } from 'nuqs';
import dynamic from 'next/dynamic';
import { VirtualizedGrid } from '@/components/common/virtualized-grid';

const UploadSchematicDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(everyone)/schematics/components/upload-schematic-dialog'),
);

const SCHEMATICS_QUERY_KEY = ['schematics'];
const SCHEMATICS_QUERY = [schematicQuerySchema, { verification: 'VERIFIED' } as const];
const COUNT_QUERY = [countSchematicSchema, { verification: 'VERIFIED' } as const];

const itemHeight = (props: { width: number }) => props.width + 44;

export function PageClient() {
	return (
		<PreviewContainer>
			<PreviewContainerHeader>
				<SearchBar tags="schematics" sorts={SORT_TAGS} author size />
			</PreviewContainerHeader>
			<ApiItem
				route={api.v4.schematics.findAll}
				queryKey={SCHEMATICS_QUERY_KEY}
				query={SCHEMATICS_QUERY}
				loading={() => (
					<PreviewContainerContent>
						<Skeletons>
							<PreviewSkeleton items={4} />
						</Skeletons>
					</PreviewContainerContent>
				)}
			>
				{(items) => (
					<VirtualizedGrid items={items} getItemHeight={itemHeight}>
						{({ item }) => (
							<SchematicPreviewCard key={item.id} data={item}>
								<LikeButton itemType="schematics" data={item} variant="outline" />
								<CommentButton itemType="schematics" data={item} />
								<DownloadButton itemType="schematics" queryKey={SCHEMATICS_QUERY_KEY} data={item} />
								<SchematicCopyButton data={item} />
							</SchematicPreviewCard>
						)}
					</VirtualizedGrid>
				)}
			</ApiItem>
			<PreviewContainerFooter>
				<UploadSchematicButton />
				<ApiPagination
					route={api.v4.schematics.count}
					queryKey={SCHEMATICS_QUERY_KEY}
					query={COUNT_QUERY}
				/>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}

function UploadSchematicButton() {
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
							<Tran text="upload.schematic" />
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Import a .msch file or paste a schematic string.
						</DialogDescription>
					</DialogHeader>
					<UploadSchematicDialog />
				</DialogContent>
			</Suspense>
		</Dialog>
	);
}
