'use client';

import { RejectItemDialog } from '@/components/item/reject-item-dialog';

const SCHEMATICS_QUERY_KEY = ['schematics'];

export default function RejectSchematicButton({ id }: { id: string }) {
	return (
		<RejectItemDialog
			id={id}
			itemType="schematics"
			queryKey={SCHEMATICS_QUERY_KEY}
		/>
	);
}
