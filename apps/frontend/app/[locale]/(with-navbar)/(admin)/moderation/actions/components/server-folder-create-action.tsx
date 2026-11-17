'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function ServerFolderCreateAction({
	metadata,
}: {
	metadata: Api['server.folder.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.created-folder" /></span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.query?.path && (
				<p>
					Path: <code className="rounded bg-muted px-1">{metadata.query.path}</code>
				</p>
			)}
		</div>
	);
}
