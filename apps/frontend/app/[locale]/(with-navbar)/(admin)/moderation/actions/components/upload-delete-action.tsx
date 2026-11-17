'use client';
import type { Api } from './types';

export default function UploadDeleteAction({
	metadata,
}: {
	metadata: Api['upload.delete'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Deleted upload:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
