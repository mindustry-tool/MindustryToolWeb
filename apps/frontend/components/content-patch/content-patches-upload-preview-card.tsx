'use client';

import { DownloadButton } from '@/components/buttons/download-button';
import { ContentPatchPreviewCard } from '@/components/content-patch/content-patch-preview-card';
import { Button } from '@/components/ui/button';
import { ContentPatchDto } from '@mindustry-tool/api';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { X, Check } from 'lucide-react';
import VerifyContentPatchDialog from '@/components/content-patch/verify-content-patch-dialog';
import { RejectItemDialog } from '@/components/item/reject-item-dialog';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];

export function ContentPatchesUploadPreviewCard({ data }: { data: ContentPatchDto }) {
	const targetId = data.itemId ?? data.id;

	return (
		<ContentPatchPreviewCard data={data}>
			<DownloadButton queryKey={CONTENT_PATCHES_QUERY_KEY} itemType="content-patches" data={data} />
			<RejectItemDialog
				id={targetId}
				itemType="content-patches"
				queryKey={CONTENT_PATCHES_QUERY_KEY}
				trigger={
				<Button variant="outline">
					<X className="size-4" />
				</Button>
				}
			/>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<Check />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<VerifyContentPatchDialog data={data} />
				</DialogContent>
			</Dialog>
		</ContentPatchPreviewCard>
	);
}
