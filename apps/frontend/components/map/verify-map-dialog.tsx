'use client';

import type { MapDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Check, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MutateButton } from '@/components/buttons/mutate-button';
import {
	DetailAuthor,
	DetailDescription,
	DetailFooter,
	DetailGrid,
	DetailHeader,
	DetailImage,
	DetailInfoSection,
	DetailMetadata,
	DetailSize,
	DetailStatItem,
	DetailStats,
} from '@/components/common/detail';
import ErrorMessage from '@/components/error/error-message';
import NotFoundCard from '@/components/common/not-found-card';
import { ItemFieldEditDialog } from '@/components/item/item-field-edit-dialog';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { TagUpdateContainer } from '@/components/tag/tag-update-container';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

const MAPS_QUERY_KEY = ['maps'];

export default function VerifyMapDialog({ data }: { data: MapDto }) {
	const targetId = data.itemId;
	const mapsKey = useMemo(() => ['maps', targetId], [targetId]);
	const [tagCount, setTagCount] = useState<number>();
	const { t } = useI18n('map');

	const {
		data: mapData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: mapsKey,
		queryFn: () =>
			apiInstance.request(api.v4.maps.get, {
				params: {
					id: targetId,
				},
			}),
	});

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
				<LoadingSpinner className="size-8 text-foreground/80" />
				<div className="space-y-0.5">
					<p className="text-sm font-medium text-foreground">
						<Tran text="map.loading" />
					</p>
					<p className="text-xs text-muted-foreground">
						<Tran text="map.fetching-map" />
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-12 px-2 text-center">
				<AlertCircle className="size-8 text-destructive" />
				<div className="space-y-1 max-w-sm">
					<p className="text-sm font-medium text-foreground">
						<Tran text="map.failed-to-load" />
					</p>
					<ErrorMessage error={error} />
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs gap-1.5 mt-1">
					<RotateCcw className="size-3.5" />
					<Tran text="retry" />
				</Button>
			</div>
		);
	}

	if (!mapData) {
		return <NotFoundCard />;
	}

	const { itemId, name, description, tags, createdAt, createdBy, width, height, meta, verificationStatus } = mapData;
	const effectiveTagCount = tagCount ?? tags.length;
	const cartographer = (meta?.author as string | undefined) || (meta?.meta?.author as string | undefined);

	return (
		<div className="flex flex-col gap-2 pt-1">
			<DetailGrid className="gap-4">
				<DetailImage
					itemType="maps"
					data={{ itemId: targetId }}
					width={width}
					height={height}
					name={name}
					verificationStatus={verificationStatus}
					topLeftOverlay={
						cartographer ? (
							<div className="absolute top-2.5 left-2.5 z-20">
								<span className="rounded border border-border/60 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
									{cartographer}
								</span>
							</div>
						) : undefined
					}
				/>

				<DetailInfoSection>
					{/* Title & Attribution */}
					<div className="space-y-1">
						<div className="flex items-center gap-1.5 flex-wrap">
							<DetailHeader className="text-base font-semibold">{name}</DetailHeader>
							<ItemFieldEditDialog
								title={t('edit-map-name')}
								fieldKey="name"
								value={name}
								queryKey={mapsKey}
								maxLength={100}
								placeholder={t('enter-map-name-placeholder')}
								triggerTitle={t('edit-name')}
								onSave={(newName) =>
									apiInstance.request(api.v4.maps.update, {
										params: { id: targetId },
										body: { name: newName },
									})
								}
							/>
						</div>
						<DetailAuthor
							createdBy={createdBy}
							createdAt={createdAt}
						/>
						<DetailDescription
							action={
								<ItemFieldEditDialog
									title={t('edit-map-description')}
									fieldKey="description"
									value={description ?? ''}
									queryKey={mapsKey}
									multiline
									maxLength={2000}
									placeholder={t('enter-map-description-placeholder')}
									triggerTitle={t('edit-description')}
									onSave={(newDesc) =>
										apiInstance.request(api.v4.maps.update, {
											params: { id: targetId },
											body: { description: newDesc },
										})
									}
								/>
							}
						>
							{description}
						</DetailDescription>
					</div>

					{/* Technical Specs Strip */}
					<DetailStats>
						<DetailStatItem
							label={<Tran text="dimensions" />}
							value={<DetailSize size={{ width, height }} />}
						/>
						<DetailStatItem
							label={<Tran text="map.cartographer" />}
							value={cartographer || <Tran text="anonymous" />}
						/>
					</DetailStats>

					{/* Tags Station */}
					<TagUpdateContainer
						className="rounded-md border border-border bg-card shadow-lg p-2.5"
						queryKey={MAPS_QUERY_KEY}
						itemType="maps"
						tags={tags}
						itemId={itemId}
						onTagsChange={(newTags) => setTagCount(newTags.length)}
					/>

					{/* Map Metadata & Rules Inspection */}
					{meta && (
						<div className="flex items-center justify-between rounded-md border border-border bg-card shadow-lg px-3.5 py-2.5">
							<div className="space-y-0.5">
								<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
									<Tran text="map.map-metadata-rules" />
								</div>
								<p className="text-xs text-muted-foreground">
									<Tran text="map.inspect-game-rules" />
								</p>
							</div>
							<DetailMetadata meta={meta} />
						</div>
					)}
				</DetailInfoSection>
			</DetailGrid>

			{/* Footer Actions */}
			<DetailFooter>
				<DialogClose asChild>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 text-xs text-muted-foreground hover:text-foreground"
					>
						<Tran text="close" />
					</Button>
				</DialogClose>
				<MutateButton
					disabled={effectiveTagCount === 0}
					mutationKey={mapsKey}
					queryKey={MAPS_QUERY_KEY}
					size="sm"
					className="h-8 px-4 text-xs font-medium"
					mutationFn={() =>
						apiInstance.request(api.v4.verification.verify, {
							params: {
								itemType: 'maps',
								id: targetId,
							},
						})
					}
				>
					<Check className="size-3.5 mr-1" />
					<Tran text="verify" />
				</MutateButton>
			</DetailFooter>
		</div>
	);
}
