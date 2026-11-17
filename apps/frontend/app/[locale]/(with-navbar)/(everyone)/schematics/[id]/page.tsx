import type { Locale } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { stripColors } from '@mindustry-tool/api';
import dynamic from 'next/dynamic';

import { DownloadButton } from '@/components/buttons/download-button';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';
import {
	Detail,
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
import { CommentButton } from '@/components/common/preview';
import CommentSection from '@/components/comment/comment-section.client';
import ErrorMessage from '@/components/error/error-message';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { RequirementContainer } from '@/components/schematic/requirement-container';
import { SchematicCopyButton } from '@/components/schematic/schematic-copy-button';
import { TagContainer } from '@/components/tag/tag-container';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { apiInstance } from '@/config/api';
import environment from '@/config/environment';
import { routes } from '@/config/routes';
import { getTranslation } from '@/i18n/i18n.server';
import { Tran } from '@/i18n/tran';
import { throwNotFound } from '@/lib/error.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { cache, Suspense } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const SCHEMATICS_QUERY_KEY = ['schematics'];

const VerifySchematicDialog = dynamic(() => import('@/components/schematic/verify-schematic-dialog'));
const RejectSchematicButton = dynamic(() => import('@/components/schematic/reject-schematic-button'));

const getSchematic = cache(async (id: string) => {
	return await apiInstance.tryRequest(api.v4.schematics.get, {
		params: { id },
		timeout: 5000,
	});
});

export async function generateMetadata({ params }: PageProps<'/[locale]/schematics/[id]'>): Promise<Metadata> {
	const { id, locale } = await params;

	const [data, error] = await getSchematic(id);

	if (error) {
		return {
			title: String(error),
		};
	}

	const { itemId, name, description, tags, createdAt, createdBy, createdByUser, meta, downloads, likes, verificationStatus } = data;
	const { requirements } = meta;

	const { t } = await getTranslation(locale as Locale, ['schematics', 'tags']);

	return {
		title: formatTitle(stripColors(name)),
		description: stripColors(description),
		openGraph: {
			type: 'article',
			title: stripColors(name),
			description: `Author: ${createdByUser.name}\n⬇️${downloads} 👍${likes} \nTags: ${tags
				.map((tag) => tag.fullTag.split('_'))
				.map(([category, name]) => `${t(category!)} ${t(name!)}`)
				.join(', ')} \n${stripColors(description)}\nRequirements: ${requirements
				.map((requirement) => `${requirement.amount} ${t(requirement.name)}`)
				.join(', ')}\nStatus: ${verificationStatus}`,
			images: `${environment.url.apiV4}/schematics/${itemId}/image.png?variant=preview&format=webp`,
			authors: [`${environment.url.base}/users/${createdBy}`],
			tags: tags.map((tag) => tag.name),
			publishedTime: new Date(createdAt).toISOString(),
		},
		alternates: generateAlternate(`/schematics/${itemId}`),
	};
}

export default async function Page({ params }: PageProps<'/[locale]/schematics/[id]'>) {
	const { id } = await params;

	const [data, error] = await getSchematic(id);

	throwNotFound(error);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	const { itemId, name, description, tags, createdAt, createdBy, meta, verifierId, width, height, verificationStatus } =
		data;
	const { powerConsumption, powerProduction, requirements } = meta;

	return (
		<Detail>
			<DetailGrid>
				<DetailImage
					itemType="schematics"
					data={{ itemId }}
					width={width}
					height={height}
					name={name}
					verificationStatus={verificationStatus}
					topRightOverlay={
						<Suspense>
							<ShareButton
								className="h-6 w-6 rounded border border-border/60 bg-background/80 hover:bg-background p-0 text-muted-foreground hover:text-foreground transition-colors"
								size="icon"
								variant="ghost"
								url={routes.database.schematics.id({ id })}
							/>
						</Suspense>
					}
				/>
				<DetailInfoSection>
					<div className="space-y-1">
						<DetailHeader>{name}</DetailHeader>
						<DetailAuthor createdBy={createdBy} createdAt={createdAt} verifierId={verifierId} />
						<DetailDescription>{description}</DetailDescription>
					</div>

					<DetailStats>
						<DetailStatItem label={<Tran text="dimensions" />} value={<DetailSize size={{ width, height }} />} />
						<DetailStatItem
							label={<Tran text="power-balance" />}
							value={<NetPower powerProduction={powerProduction} powerConsumption={powerConsumption} showBreakdown />}
						/>
						<DetailStatItem label={<Tran text="blocks" />} value={meta.blocks?.length ?? 0} />
					</DetailStats>

					<DetailSection title={<Tran text="tags" />}>
						<TagContainer tags={tags} />
					</DetailSection>

					{requirements && requirements.length > 0 && (
						<DetailSection title={<Tran text="requirements" />}>
							<RequirementContainer requirements={requirements} />
						</DetailSection>
					)}

					<DetailFooter>
						<LikeButton itemType="schematics" data={data} variant="outline" />
						<CommentButton itemType="schematics" data={data} />
						<DownloadButton itemType="schematics" queryKey={SCHEMATICS_QUERY_KEY} data={data} />
						<SchematicCopyButton data={data} />
						<EllipsisButton variant="outline">
							<ClientProtectedElement filter="schematic:manage">
								<Dialog>
									<DialogTrigger asChild>
										<Button className="justify-start" variant="command">
											<Check />
											<Tran text="verify" />
										</Button>
									</DialogTrigger>
									<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
										<VisuallyHidden.Root>
											<DialogHeader className="gap-0.5 pb-1">
												<DialogTitle className="text-base font-semibold">
													<Tran text="verify.schematic" />
												</DialogTitle>
												<DialogDescription className="text-xs text-muted-foreground">
													Review schematic specifications and confirm verification.
												</DialogDescription>
											</DialogHeader>
										</VisuallyHidden.Root>
										<VerifySchematicDialog data={data} />
									</DialogContent>
								</Dialog>
								<RejectSchematicButton id={id} />
							</ClientProtectedElement>
						</EllipsisButton>
					</DetailFooter>
				</DetailInfoSection>
			</DetailGrid>

			<div className="w-full border-t border-border/60 pt-6">
				<CommentSection itemType="schematics" itemId={itemId} />
			</div>
		</Detail>
	);
}
