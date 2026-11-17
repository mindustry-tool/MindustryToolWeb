'use client';
import type { Api } from './types';

export default function TagDeleteAction({
	metadata,
}: {
	metadata: Api['tag.delete'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Deleted tag:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
