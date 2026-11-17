'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function ServerFileDeleteAction({
	metadata,
}: {
	metadata: Api['server.file.delete'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.deleted-file" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.query?.path && (
				<p>
					Path: <code className="rounded bg-muted px-1">{metadata.query.path}</code>
				</p>
			)}
		</div>
	);
}
