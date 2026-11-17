'use client';

import { type SearchVerificationStatus } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { countContentPatchSchema, queryContentPatchSchema } from '@mindustry-tool/api';
import { SORT_TAGS, VERIFICATION_STATUSES } from '@mindustry-tool/api';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import ComboBox from '@/components/combo-box/combo-box';

import { PreviewContainer, PreviewContainerContent, PreviewContainerHeader } from '@/components/common/preview';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { ContentPatchesUploadPreviewCard } from '@/components/content-patch/content-patches-upload-preview-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Tran } from '@/i18n/tran';
import { Separator } from '@/components/ui/separator';
import ProtectedRoute from '@/components/layout/protected-route';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];

export default function Page() {
	return (
		<Suspense>
			<ProtectedRoute filter="content-patch:manage">
				<Content />
			</ProtectedRoute>
		</Suspense>
	);
}

function Content() {
	const [verificationStatus, setVerificationStatus] = useQueryState('verification', {
		defaultValue: 'PENDING',
	});

	return (
		<PreviewContainer>
			<PreviewContainerHeader>
				<SearchBar tags="content-patches" sorts={SORT_TAGS} author size>
					<ComboBox
						className="bg-card flex-1"
						portal={false}
						required
						value={verificationStatus}
						values={['ALL', ...VERIFICATION_STATUSES]}
						onChange={(value) => setVerificationStatus(value)}
						render={(v) => <Tran key={v} text={v.toLowerCase() as Lowercase<string>} />}
					/>
				</SearchBar>
			</PreviewContainerHeader>
			<PreviewContainerContent>
				<ApiItem
					queryKey={CONTENT_PATCHES_QUERY_KEY}
					route={api.v4.contentPatches.getAll}
					query={[
						queryContentPatchSchema,
						{
							verification: verificationStatus as SearchVerificationStatus,
						},
					]}
				>
					{(items) => items.map((item) => <ContentPatchesUploadPreviewCard key={item.id} data={item} />)}
				</ApiItem>
			</PreviewContainerContent>
			<Separator className="mt-auto" />
			<ApiPagination
				className="ml-auto"
				route={api.v4.contentPatches.count}
				queryKey={CONTENT_PATCHES_QUERY_KEY}
				query={[countContentPatchSchema, { verification: verificationStatus as SearchVerificationStatus }]}
			/>
		</PreviewContainer>
	);
}
