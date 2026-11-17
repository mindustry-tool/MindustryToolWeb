'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function UserMeUpdateAction({
	metadata,
}: {
	metadata: Api['user.me.update'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Updated own profile</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
