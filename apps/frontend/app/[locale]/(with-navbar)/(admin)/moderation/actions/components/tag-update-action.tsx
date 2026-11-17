'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function TagUpdateAction({
	metadata,
}: {
	metadata: Api['tag.update'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Updated tag:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
