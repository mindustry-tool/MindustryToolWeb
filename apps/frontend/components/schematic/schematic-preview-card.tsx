import type { SchematicDto } from '@mindustry-tool/api';
import { Suspense, useMemo, type ReactNode } from 'react';
import { ShareButton } from '@/components/buttons/share-button';
import { PreviewCard, PreviewFooter, PreviewHeader, PreviewImage, PreviewLink } from '@/components/common/preview';
import { routes } from '@/config/routes';

type SchematicPreviewCardProps = {
	data: SchematicDto;
	children: ReactNode;
};

export function SchematicPreviewCard({ data, children }: SchematicPreviewCardProps) {
	const { itemId, name } = data;
    const url = useMemo(() => routes.database.schematics.id({ id: itemId }), [itemId]);

	return (
		<PreviewCard>
			<Suspense>
				<ShareButton className="absolute top-1 left-1" variant="ghost" url={url} />
			</Suspense>
			<PreviewLink itemType="schematics" data={data}>
				<PreviewImage itemType="schematics" data={data} />
				<PreviewHeader>{name}</PreviewHeader>
			</PreviewLink>
			<PreviewFooter>{children}</PreviewFooter>
		</PreviewCard>
	);
}
