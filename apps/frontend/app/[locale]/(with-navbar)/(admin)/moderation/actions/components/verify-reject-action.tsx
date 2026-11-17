'use client';
import type { Api } from './types';
import { ItemPreviewCard } from './item-preview-card';

export default function VerifyRejectAction({
	metadata,
}: {
	metadata: Api['verify.reject'];
}) {
	return <ItemPreviewCard data={metadata.params} />;
}
