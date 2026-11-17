'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';
import { Tran } from '@/i18n/tran';

export default function RoleCreateAction({
	metadata,
}: {
	metadata: Api['role.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.created-role" /></span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
