'use client';

import { useMemo } from 'react';

import type { ContentPatchDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { MutateButton } from '@/components/buttons/mutate-button';
import {
	DetailAuthor,
	DetailDescription,
	DetailFooter,
	DetailHeader,
	DetailSection,
	UploadDetail,
	UploadDetailContent,
} from '@/components/common/detail';
import NotFoundCard from '@/components/common/not-found-card';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { TagUpdateContainer } from '@/components/tag/tag-update-container';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import JsonDisplay from '@/components/common/json-display';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];

export default function VerifyContentPatchDialog({ data }: { data: ContentPatchDto }) {
	const targetId = data.itemId ?? data.id;
	const contentPatchDetailKey = useMemo(() => ['content-patches', targetId], [targetId]);
	const { data: contentPatch, isLoading } = useQuery({
		queryKey: contentPatchDetailKey,
		queryFn: () =>
			apiInstance.request(api.v4.contentPatches.get, {
				params: {
					id: targetId,
				},
			}),
	});

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!contentPatch) {
		return <NotFoundCard />;
	}

	const { name, description, data: patchData, itemId, createdBy, tags, createdAt, children, type } = contentPatch;

	return (
		<>
			<DialogTitle>
				<DetailHeader className="text-lg font-semibold">{name}</DetailHeader>
			</DialogTitle>
			<VisuallyHidden>
				<DialogDescription />
			</VisuallyHidden>
			<UploadDetail>
				<UploadDetailContent>
					<DetailAuthor createdBy={createdBy} createdAt={createdAt} />
					<DetailDescription>{description}</DetailDescription>
					<TagUpdateContainer
						className="rounded-md border border-border bg-card shadow-lg p-2.5"
						queryKey={CONTENT_PATCHES_QUERY_KEY}
						itemType="content-patches"
						tags={tags}
						itemId={itemId}
					/>
					{type === 'DATA' && (
						<DetailSection title={<Tran text="data" />}>
							<JsonDisplay json={patchData} />
						</DetailSection>
					)}
					{type === 'DATAPACK' && children.length > 0 && (
						<DetailSection title={<Tran text="children" />}>
							<div className="flex flex-col gap-2">
								{children.map(({ id, name: childName, description: childDesc }) => (
									<div key={id} className="flex flex-col gap-1 bg-muted/20 border border-border/60 px-2.5 py-1.5 rounded-md">
										<span className="font-semibold text-xs text-foreground">{childName}</span>
										<span className="text-xs text-muted-foreground">{childDesc}</span>
									</div>
								))}
							</div>
						</DetailSection>
					)}
				</UploadDetailContent>
				<DetailFooter>
					<DialogClose asChild>
						<Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
							<Tran text="close" />
						</Button>
					</DialogClose>
					<MutateButton
						disabled={tags.length === 0}
						mutationKey={contentPatchDetailKey}
						queryKey={CONTENT_PATCHES_QUERY_KEY}
						size="sm"
						className="h-8 px-4 text-xs font-medium"
						mutationFn={() =>
							apiInstance.request(api.v4.verification.verify, {
								params: {
									itemType: 'content-patches',
									id: targetId,
								},
							})
						}
					>
						<Check className="size-3.5 mr-1" />
						<Tran text="verify" />
					</MutateButton>
				</DetailFooter>
			</UploadDetail>
		</>
	);
}
