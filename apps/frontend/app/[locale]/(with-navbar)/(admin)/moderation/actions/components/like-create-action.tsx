'use client';
import type { Api } from './types';
import { ItemPreviewCard } from './item-preview-card';

export default function LikeCreateAction({ metadata }: { metadata: Api['like.create'] }) {
	return <ItemPreviewCard data={{ itemType: metadata.params.itemType, id: metadata.params.itemId }} />;
}
