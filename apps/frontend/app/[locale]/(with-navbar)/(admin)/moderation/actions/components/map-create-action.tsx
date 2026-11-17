'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function MapCreateAction({}: { metadata: Api['map.create'] }) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.created-map" /></span>
		</div>
	);
}
