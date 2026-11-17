'use client';
import type { Api } from './types';

export default function ServerHostServerAction({
	metadata,
}: {
	metadata: Api['server.host-server'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Hosted server instance:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
