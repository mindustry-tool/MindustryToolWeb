import type { ItemType } from '@mindustry-tool/api';
import { Download } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import environment from '@/config/environment';

export function DownloadButton({
	itemType,
	data,
}: {
	queryKey: string[];
	itemType: ItemType;
	data: { itemId: string; downloads: number };
}) {
	const itemId = data.itemId;
	const href = `${environment.url.apiV4}/${itemType}/${itemId}/data`;

	return (
		<Button variant="outline" asChild>
			<Link href={href}>
				<Download className="size-4" />
				{data.downloads}
			</Link>
		</Button>
	);
}
