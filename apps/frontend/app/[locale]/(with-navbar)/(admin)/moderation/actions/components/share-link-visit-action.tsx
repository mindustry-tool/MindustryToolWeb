'use client';
import type { Api } from './types';

export default function ShareLinkVisitAction({
	metadata,
}: {
	metadata: Api['share-link.visit'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Visited share link:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
