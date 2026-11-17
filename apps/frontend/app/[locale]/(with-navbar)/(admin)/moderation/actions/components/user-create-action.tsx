'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function UserCreateAction({
	metadata,
}: {
	metadata: Api['user.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created user</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
