'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function MapImageAction({}: { metadata: Api['map.image'] }) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.generated-map-image" /></span>
		</div>
	);
}
