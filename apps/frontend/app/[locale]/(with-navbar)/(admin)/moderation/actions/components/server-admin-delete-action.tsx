'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function ServerAdminDeleteAction({
	metadata,
}: {
	metadata: Api['server.admin.delete'];
}) {
	return (
		<div className="space-y-1">
			<p>
				<span className="font-medium"><Tran text="moderation.removed-admin" /></span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.adminId}</code>
			</p>
			<p>
				<span className="font-medium"><Tran text="moderation.from-server" /></span>
				<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			</p>
		</div>
	);
}
