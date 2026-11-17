'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function ShareLinkCreateAction({
	metadata,
}: {
	metadata: Api['share-link.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created share link</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
