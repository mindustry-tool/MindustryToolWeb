'use client';
import type { Api } from './types';

export default function UserBanAction({
	metadata,
}: {
	metadata: Api['user.ban'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Banned user:</span>
			<code className="ml-1 rounded bg-muted px-1">{metadata.params.id}</code>
			{metadata.body?.bannedUntil && (
				<p>
					Until: <code className="rounded bg-muted px-1">{String(metadata.body.bannedUntil)}</code>
				</p>
			)}
			{!metadata.body?.bannedUntil && <p className="text-muted-foreground">Permanent ban (no expiration)</p>}
		</div>
	);
}
