'use client';
import type { Api } from './types';

export default function WikiLinkAction({
	metadata,
}: {
	metadata: Api['wiki.link'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Linked post to wiki:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body?.postId && (
				<p>
					Post: <code className="rounded bg-muted px-1">{String(metadata.body.postId)}</code>
				</p>
			)}
		</div>
	);
}
