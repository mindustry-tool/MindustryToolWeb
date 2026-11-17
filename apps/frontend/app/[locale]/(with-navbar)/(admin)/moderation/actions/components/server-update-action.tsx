'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';
import { Tran } from '@/i18n/tran';

export default function ServerUpdateAction({
	metadata,
}: {
	metadata: Api['server.update'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.updated-server" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
