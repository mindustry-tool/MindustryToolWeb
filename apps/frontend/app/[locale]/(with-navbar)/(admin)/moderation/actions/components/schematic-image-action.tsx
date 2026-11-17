'use client';
import type { Api } from './types';
import { Tran } from '@/i18n/tran';

export default function SchematicImageAction({}: { metadata: Api['schematic.image'] }) {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.generated-schematic-image" /></span>
		</div>
	);
}
