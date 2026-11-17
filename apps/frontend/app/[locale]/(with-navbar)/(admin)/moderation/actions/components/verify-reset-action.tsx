'use client';
import type { Api } from './types';
import { ItemPreviewCard } from './item-preview-card';

export default function VerifyResetAction({
	metadata,
}: {
	metadata: Api['verify.reset'];
}) {
	return <ItemPreviewCard data={metadata.params} />;
}
