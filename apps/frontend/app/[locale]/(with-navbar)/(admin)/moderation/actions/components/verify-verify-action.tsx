'use client';
import type { Api } from './types';
import { ItemPreviewCard } from './item-preview-card';

export default function VerifyVerifyAction({
	metadata,
}: {
	metadata: Api['verify.verify'];
}) {
	return <ItemPreviewCard data={metadata.params} />;
}
