'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function ServerManagerCreateAction({
	metadata,
}: {
	metadata: Api['server.manager.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created server manager</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
