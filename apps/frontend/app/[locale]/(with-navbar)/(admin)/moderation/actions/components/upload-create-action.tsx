'use client';
import type { Api } from './types';
import JsonDisplay from '@/components/common/json-display';

export default function UploadCreateAction({
	metadata,
}: {
	metadata: Api['upload.create'];
}) {
	return (
		<div className="space-y-1">
			<span className="font-medium">Created upload</span>
			{metadata.body && <JsonDisplay json={metadata.body} />}
		</div>
	);
}
