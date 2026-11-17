'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function IconDeleteAction({
	metadata,
}: {
	metadata: Api['icon.delete'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.deleted-icon" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
		</div>
	);
}
