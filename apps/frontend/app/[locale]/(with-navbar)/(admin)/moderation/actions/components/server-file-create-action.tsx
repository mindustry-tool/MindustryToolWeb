'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function ServerFileCreateAction({
	metadata,
}: {
	metadata: Api['server.file.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.installed-file" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body?.url && (
				<p>
					URL: <code className="rounded bg-muted px-1">{String(metadata.body.url)}</code>
				</p>
			)}
			{metadata.body?.path && (
				<p>
					Path: <code className="rounded bg-muted px-1">{String(metadata.body.path)}</code>
				</p>
			)}
		</div>
	);
}
