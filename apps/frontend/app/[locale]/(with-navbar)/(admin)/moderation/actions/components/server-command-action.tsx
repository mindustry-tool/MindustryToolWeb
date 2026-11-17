'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function ServerCommandAction({
	metadata,
}: {
	metadata: Api['server.command'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.command-sent" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body?.command && (
				<p>
					Command: <code className="rounded bg-muted px-1">{String(metadata.body.command)}</code>
				</p>
			)}
		</div>
	);
}
