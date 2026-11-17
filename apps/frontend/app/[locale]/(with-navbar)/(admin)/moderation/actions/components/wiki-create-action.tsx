'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function WikiCreateAction({
	metadata,
}: {
	metadata: Api['wiki.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created wiki page</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
