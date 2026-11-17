'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function MapPreviewAction({}: { metadata: Api['map.preview'] }) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.generated-map-preview" /></span>
		</div>
	);
}
