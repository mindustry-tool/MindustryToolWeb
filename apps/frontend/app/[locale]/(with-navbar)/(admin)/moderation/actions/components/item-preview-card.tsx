'use client';
import type { ItemType } from '@mindustry-tool/api';
import { PreviewImage } from '@/components/common/preview';
import { LocalLink } from '@/components/common/locale-link';

export function ItemPreviewCard({ data: { itemType, id } }: { data: { itemType: string; id: string } }) {
	if (itemType === 'content-patches') {
		return (
			<span>
				{itemType}/{id}
			</span>
		);
	}

	return (
		<LocalLink className="text-sm underline" href={`/${itemType}/${id}`}>
			<PreviewImage className="max-w-3xs" itemType={itemType as ItemType} data={{ itemId: id }} />
		</LocalLink>
	);
}
