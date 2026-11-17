'use client';
import type { Api } from './types';

export default function ServerWebhookDeleteAction({
	metadata,
}: {
	metadata: Api['server.webhook.delete'];
}) {
	return (
		<div className="space-y-1">
			<p>
				<span className="font-medium">Deleted webhook:</span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.webhookId}</code>
			</p>
			<p>
				<span className="font-medium">Server:</span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			</p>
		</div>
	);
}
