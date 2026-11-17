'use client';
import type { Api } from './types';

export default function ServerFileWriteAction({
	metadata,
}: {
	metadata: Api['server.file.write'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Wrote file on server:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.query?.path && (
				<p>
					Path: <code className="rounded bg-muted px-1">{metadata.query.path}</code>
				</p>
			)}
		</div>
	);
}
