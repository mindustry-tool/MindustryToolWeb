'use client';

import type { SearchVerificationStatus } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { countSchematicSchema, schematicQuerySchema } from '@mindustry-tool/api';
import { SORT_TAGS, VERIFICATION_STATUSES } from '@mindustry-tool/api';
import { useQueryState } from 'nuqs';

import ComboBox from '@/components/combo-box/combo-box';

import {
	PreviewContainer,
	PreviewContainerContent,
	PreviewContainerFooter,
	PreviewContainerHeader,
	PreviewSkeleton,
} from '@/components/common/preview';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { SchematicUploadPreviewCard } from '@/components/schematic/schematic-upload-preview-card';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Tran } from '@/i18n/tran';
import ProtectedRoute from '@/components/layout/protected-route';
import { VirtualizedGrid } from '@/components/common/virtualized-grid';

const SCHEMATICS_QUERY_KEY = ['schematics'];

export default function Page() {
	return (
		<ProtectedRoute filter="schematic:manage">
			<Content />
		</ProtectedRoute>
	);
}

function Content() {
	const [verificationStatus, setVerificationStatus] = useQueryState('verification', {
		defaultValue: 'PENDING',
	});

	return (
		<PreviewContainer>
			<PreviewContainerHeader>
				<SearchBar tags="schematics" sorts={SORT_TAGS} author size>
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
			<ApiItem
				queryKey={SCHEMATICS_QUERY_KEY}
				route={api.v4.schematics.findAll}
				query={[
					schematicQuerySchema,
					{
						verification: verificationStatus as SearchVerificationStatus,
					},
				]}
				loading={() => (
					<PreviewContainerContent>
						<Skeletons>
							<PreviewSkeleton items={4} />
						</Skeletons>
					</PreviewContainerContent>
				)}
			>
				{(items) => (
					<VirtualizedGrid items={items} getItemHeight={(props) => props.width + 44}>
						{({ item }) => <SchematicUploadPreviewCard key={item.id} data={item} />}
					</VirtualizedGrid>
				)}
			</ApiItem>
			<PreviewContainerFooter>
				<ApiPagination
					className="ml-auto"
					route={api.v4.schematics.count}
					queryKey={SCHEMATICS_QUERY_KEY}
					query={[countSchematicSchema, { verification: verificationStatus as SearchVerificationStatus }]}
				/>
			</PreviewContainerFooter>
		</PreviewContainer>
	);
}
