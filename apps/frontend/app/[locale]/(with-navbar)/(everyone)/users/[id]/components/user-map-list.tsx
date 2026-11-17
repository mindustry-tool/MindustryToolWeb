'use client';
import { DownloadButton } from '@/components/buttons/download-button';
import { LikeButton } from '@/components/buttons/like-button';
import {
	PreviewContainer,
	PreviewContainerContent,
	CommentButton,
	PreviewContainerFooter,
	PreviewSkeleton,
} from '@/components/common/preview';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { MapPreviewCard } from '@/components/map/map-preview-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { api } from '@mindustry-tool/api';
import { countMapSchema, mapQuerySchema, UserDto } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { Suspense } from 'react';

const MAPS_QUERY_KEY = ['maps'];

export function UserMapList({ user }: { user: UserDto }) {
	return (
		<PreviewContainer variant="user">
			<PreviewContainerContent>
				<Suspense>
					<SearchBar className="col-span-full" tags="maps" sorts={SORT_TAGS} author size />
				</Suspense>
				<Suspense>
					<ApiItem
						route={api.v4.maps.findAll}
						queryKey={MAPS_QUERY_KEY}
						query={[mapQuerySchema, { verification: 'VERIFIED', author: user.id }]}
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
									<DownloadButton itemType="maps" queryKey={MAPS_QUERY_KEY} data={item} />
								</MapPreviewCard>
							))
						}
					</ApiItem>
				</Suspense>
			</PreviewContainerContent>
			<PreviewContainerFooter>
				<Suspense>
					<ApiPagination
						className="ml-auto"
						route={api.v4.maps.count}
						queryKey={MAPS_QUERY_KEY}
						query={[countMapSchema, { verification: 'VERIFIED' }]}
					/>
				</Suspense>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}
