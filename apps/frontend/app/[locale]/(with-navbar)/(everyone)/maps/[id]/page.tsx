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
	DetailMetadata,
	DetailSection,
	DetailSize,
	DetailStatItem,
	DetailStats,
} from '@/components/common/detail';
import { CommentButton } from '@/components/common/preview';
import CommentSection from '@/components/comment/comment-section.client';
import ErrorMessage from '@/components/error/error-message';
import { TagContainer } from '@/components/tag/tag-container';
import { apiInstance } from '@/config/api';
import environment from '@/config/environment';
import { getTranslation } from '@/i18n/i18n.server';
import { Tran } from '@/i18n/tran';
import { throwNotFound } from '@/lib/error.utils';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import { Metadata } from 'next';
import { cache, Suspense } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { routes } from '@/config/routes';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const MAPS_QUERY_KEY = ['maps'];

const VerifyMapDialog = dynamic(() => import('@/components/map/verify-map-dialog'));
const RejectMapButton = dynamic(() => import('@/components/map/reject-map-button'));

const getMap = cache(async (id: string) => {
	return await apiInstance.tryRequest(api.v4.maps.get, {
		params: { id },
		timeout: 5000,
	});
});

export async function generateMetadata({ params }: PageProps<'/[locale]/maps/[id]'>): Promise<Metadata> {
	const { id, locale } = await params;

	const [data, error] = await getMap(id);

	if (error) {
		return {
			title: String(error),
		};
	}

	const { itemId, name, description, tags, createdAt, createdBy, createdByUser, downloads, likes, verificationStatus } = data;

	const { t } = await getTranslation(locale as Locale, ['maps', 'tags']);

	return {
		title: formatTitle(stripColors(name)),
		description: stripColors(description || ''),
		openGraph: {
			type: 'article',
			title: name,
			description: `Author: ${createdByUser.name}\n⬇️${downloads} 👍${likes} \nTags: ${tags
				.map((tag) => tag.fullTag.split('_'))
				.map(([category, name]) => `${t(category!)} ${t(name!)}`)
				.join(', ')} \n${stripColors(description || '')}\nStatus: ${verificationStatus}`,
			images: `${environment.url.apiV4}/maps/${itemId}/image.png`,
			authors: [`${environment.url.base}/users/${createdBy}`],
			tags: tags.map((tag) => tag.name),
			publishedTime: new Date(createdAt).toISOString(),
		},
		alternates: generateAlternate(`/maps/${id}`),
	};
}

export default async function Page({ params }: PageProps<'/[locale]/maps/[id]'>) {
	const { id } = await params;

	const [data, error] = await getMap(id);

	throwNotFound(error);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	const { itemId, name, description, tags, createdAt, createdBy, meta, verifierId, width, height, verificationStatus } =
		data;
	const cartographer = (meta?.author as string | undefined) || (meta?.meta?.author as string | undefined);

	return (
		<Detail>
			<DetailGrid>
				<DetailImage
					itemType="maps"
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
								url={routes.database.maps.id({ id })}
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
							label={<Tran text="map.cartographer" />}
							value={cartographer || <Tran text="anonymous" />}
						/>
					</DetailStats>

					<DetailSection title={<Tran text="tags" />}>
						<TagContainer tags={tags} />
					</DetailSection>

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

					<DetailFooter>
						<LikeButton itemType="maps" data={data} variant="outline" />
						<CommentButton itemType="maps" data={data} />
						<DownloadButton itemType="maps" queryKey={MAPS_QUERY_KEY} data={data} />
						<EllipsisButton variant="outline">
							<ClientProtectedElement filter="map:manage">
								<Dialog>
									<DialogTrigger asChild>
										<Button className="justify-start" variant="command">
											<Check />
											<Tran text="verify" />
										</Button>
									</DialogTrigger>
									<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
										<VisuallyHidden>
											<DialogHeader className="gap-0.5 pb-1">
												<DialogTitle className="text-base font-semibold">
													<Tran text="verify.map" />
												</DialogTitle>
												<DialogDescription className="text-xs text-muted-foreground">
													Review map specifications and confirm verification.
												</DialogDescription>
											</DialogHeader>
										</VisuallyHidden>
										<VerifyMapDialog data={data} />
									</DialogContent>
								</Dialog>
								<RejectMapButton id={id} />
							</ClientProtectedElement>
						</EllipsisButton>
					</DetailFooter>
				</DetailInfoSection>
			</DetailGrid>

			<div className="w-full border-t border-border/60 pt-6">
				<CommentSection itemType="maps" itemId={itemId} />
			</div>
		</Detail>
	);
}
