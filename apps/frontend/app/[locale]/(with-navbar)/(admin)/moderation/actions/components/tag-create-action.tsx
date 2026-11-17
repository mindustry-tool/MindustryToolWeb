'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function TagCreateAction({
	metadata,
}: {
	metadata: Api['tag.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created tag</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
