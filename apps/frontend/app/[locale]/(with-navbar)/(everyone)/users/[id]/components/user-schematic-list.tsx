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
import { SchematicCopyButton } from '@/components/schematic/schematic-copy-button';
import { SchematicPreviewCard } from '@/components/schematic/schematic-preview-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { api } from '@mindustry-tool/api';
import { countSchematicSchema, schematicQuerySchema, UserDto } from '@mindustry-tool/api';
import { SORT_TAGS } from '@mindustry-tool/api';
import { Suspense } from 'react';

const SCHEMATICS_QUERY_KEY = ['schematics'];

export function UserSchematicList({ user }: { user: UserDto }) {
	return (
		<PreviewContainer variant="user">
			<PreviewContainerContent>
				<Suspense>
					<SearchBar className="col-span-full" tags="schematics" sorts={SORT_TAGS} author size />
				</Suspense>
				<Suspense>
					<ApiItem
						route={api.v4.schematics.findAll}
						queryKey={SCHEMATICS_QUERY_KEY}
						query={[schematicQuerySchema, { verification: 'VERIFIED', author: user.id }]}
						loading={() => (
							<Skeletons>
								<PreviewSkeleton items={4} />
							</Skeletons>
						)}
						empty={() => <div className="col-span-full text-center text-xl">No schematic found</div>}
					>
						{(items) =>
							items.map((item) => (
								<SchematicPreviewCard key={item.id} data={item}>
									<LikeButton itemType="schematics" data={item} variant="outline" />
									<CommentButton itemType="schematics" data={item} />
									<DownloadButton itemType="schematics" queryKey={SCHEMATICS_QUERY_KEY} data={item} />
									<SchematicCopyButton data={item} />
								</SchematicPreviewCard>
							))
						}
					</ApiItem>
				</Suspense>
			</PreviewContainerContent>
			<PreviewContainerFooter>
				<Suspense>
					<ApiPagination
						className="ml-auto"
						route={api.v4.schematics.count}
						queryKey={SCHEMATICS_QUERY_KEY}
						query={[countSchematicSchema, { verification: 'VERIFIED' }]}
					/>
				</Suspense>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}
