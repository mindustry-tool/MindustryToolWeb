'use client';
import type { Api } from './types';

export default function WikiLinkRemoveAction({
	metadata,
}: {
	metadata: Api['wiki.link.remove'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Removed link</span>
			<p>
				Wiki: <code className="rounded bg-muted px-1">{metadata.params.wikiId}</code>
			</p>
			<p>
				Post: <code className="rounded bg-muted px-1">{metadata.params.postId}</code>
			</p>
		</div>
	);
}
