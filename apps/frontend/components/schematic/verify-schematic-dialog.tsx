'use client';

import type { SchematicDto } from '@mindustry-tool/api';
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
	DetailSection,
	DetailSize,
	DetailStatItem,
	DetailStats,
	NetPower,
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
import { RequirementContainer } from '@/components/schematic/requirement-container';

const SCHEMATICS_QUERY_KEY = ['schematics'];

export default function VerifySchematicDialog({ data }: { data: SchematicDto }) {
	const targetId = data.itemId;
	const queryKey = useMemo(() => ['schematics', targetId], [targetId]);
	const [tagCount, setTagCount] = useState<number>();
	const { t } = useI18n('schematic');

	const {
		data: detail,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey,
		queryFn: () =>
			apiInstance.request(api.v4.schematics.get, {
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
						<Tran text="schematic.loading" />
					</p>
					<p className="text-xs text-muted-foreground">
						<Tran text="schematic.fetching-blocks" />
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
						<Tran text="schematic.failed-to-load" />
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

	if (!detail) {
		return <NotFoundCard />;
	}

	const { itemId, name, description, tags, createdAt, createdBy, width, height, meta, verificationStatus } = detail;
	const { powerConsumption, powerProduction, requirements } = meta;
	const effectiveTagCount = tagCount ?? tags.length;

	return (
		<div className="flex flex-col gap-2 pt-1">
			<DetailGrid className="gap-4">
				<DetailImage
					itemType="schematics"
					data={{ itemId: targetId }}
					width={width}
					height={height}
					name={name}
					verificationStatus={verificationStatus}
				/>

				<DetailInfoSection>
					{/* Title & Attribution */}
					<div className="space-y-1">
						<div className="flex items-center gap-1.5 flex-wrap">
							<DetailHeader className="text-base font-semibold">{name}</DetailHeader>
							<ItemFieldEditDialog
								title={t('edit-schematic-name')}
								fieldKey="name"
								value={name}
								queryKey={queryKey}
								maxLength={100}
								placeholder={t('enter-schematic-name-placeholder')}
								triggerTitle={t('edit-name')}
								onSave={(newName) =>
									apiInstance.request(api.v4.schematics.update, {
										params: { id: targetId },
										body: { name: newName },
									})
								}
							/>
						</div>
						<DetailAuthor createdBy={createdBy} createdAt={createdAt} />
						<DetailDescription
							action={
								<ItemFieldEditDialog
									title={t('edit-schematic-description')}
									fieldKey="description"
									value={description ?? ''}
									queryKey={queryKey}
									multiline
									maxLength={2000}
									placeholder={t('enter-schematic-description-placeholder')}
									triggerTitle={t('edit-description')}
									onSave={(newDesc) =>
										apiInstance.request(api.v4.schematics.update, {
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
							label={<Tran text="power-balance" />}
							value={<NetPower powerProduction={powerProduction} powerConsumption={powerConsumption} />}
						/>
						<DetailStatItem
							label={<Tran text="blocks" />}
							value={meta.blocks?.length ?? 0}
						/>
					</DetailStats>

					{/* Tags Station */}
					<TagUpdateContainer
						className="rounded-md border border-border bg-card shadow-lg p-2.5"
						queryKey={SCHEMATICS_QUERY_KEY}
						itemType="schematics"
						tags={tags}
						itemId={itemId}
						onTagsChange={(newTags) => setTagCount(newTags.length)}
					/>

					{/* Bill of Materials (Requirements) */}
					{requirements && requirements.length > 0 && (
						<DetailSection title={<Tran text="requirements" />}>
							<RequirementContainer requirements={requirements} />
						</DetailSection>
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
					mutationKey={['schematics', targetId]}
					disabled={effectiveTagCount === 0}
					queryKey={SCHEMATICS_QUERY_KEY}
					size="sm"
					className="h-8 px-4 text-xs font-medium"
					mutationFn={() =>
						apiInstance.request(api.v4.verification.verify, {
							params: {
								itemType: 'schematics',
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
