'use client';
import type { Api } from './types';

export default function ServerHostAction({
	metadata,
}: {
	metadata: Api['server.host'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Hosted server:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
