'use client';

import { RejectItemDialog } from '@/components/item/reject-item-dialog';

const CONTENT_PATCHES_QUERY_KEY = ['content-patches'];

export default function RejectContentPatchButton({ id }: { id: string }) {
    return (
        <RejectItemDialog
            id={id}
            itemType="content-patches"
            queryKey={CONTENT_PATCHES_QUERY_KEY}
        />
    );
}
