'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function UploadUpdateAction({
	metadata,
}: {
	metadata: Api['upload.update'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Updated upload:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
