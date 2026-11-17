'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';
import { Tran } from '@/i18n/tran';

export default function ServerCreateAction({
	metadata,
}: {
	metadata: Api['server.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.created-server" /></span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
