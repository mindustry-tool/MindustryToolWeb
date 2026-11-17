'use client';

import { RejectItemDialog } from '@/components/item/reject-item-dialog';

const MAPS_QUERY_KEY = ['maps'];

export default function RejectMapButton({ id }: { id: string }) {
	return (
		<RejectItemDialog
			id={id}
			itemType="maps"
			queryKey={MAPS_QUERY_KEY}
		/>
	);
}
