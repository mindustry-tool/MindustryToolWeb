'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function DownloadAction({
	metadata,
}: {
	metadata: Api['download'];
}) {
	const { owner, repo, tag } = metadata.query || {};
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.downloaded-plugin" /></span>
			{owner && repo && tag && (
				<p>
					<code className="rounded bg-muted px-1">{owner}/{repo}</code>
					<span className="ml-1">@{tag}</span>
				</p>
			)}
		</div>
	);
}
