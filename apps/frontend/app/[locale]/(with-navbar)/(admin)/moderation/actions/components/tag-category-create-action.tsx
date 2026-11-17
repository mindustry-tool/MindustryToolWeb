'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function TagCategoryCreateAction({
	metadata,
}: {
	metadata: Api['tag.category.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created tag category</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
