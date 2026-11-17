'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function ServerWebhookUpdateAction({
	metadata,
}: {
	metadata: Api['server.webhook.update'];
}) {
	return (
		<div className="space-y-1">
			<p>
				<span className="font-medium">Updated webhook:</span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.webhookId}</code>
			</p>
			<p>
				<span className="font-medium">Server:</span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			</p>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
