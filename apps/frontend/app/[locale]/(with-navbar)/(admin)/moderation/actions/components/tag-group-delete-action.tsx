'use client';
import type { Api } from './types';

export default function TagGroupDeleteAction({
	metadata,
}: {
	metadata: Api['tag.group.delete'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Deleted tag group:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			<p>
				Category: <code className="rounded bg-muted px-1">{metadata.params.categoryId}</code>
			</p>
		</div>
	);
}
