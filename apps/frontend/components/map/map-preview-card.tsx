import type { MapDto } from '@mindustry-tool/api';
import { Suspense, type ReactNode } from 'react';
import { ShareButton } from '@/components/buttons/share-button';
import { PreviewCard, PreviewFooter, PreviewHeader, PreviewImage, PreviewLink } from '@/components/common/preview';
import { routes } from '@/config/routes';

type MapPreviewCardProps = {
	data: MapDto;
	children: ReactNode;
};

export function MapPreviewCard({ children, data }: MapPreviewCardProps) {
	const { itemId, name } = data;

	return (
		<PreviewCard>
			<Suspense>
				<ShareButton className="absolute top-1 left-1" variant="ghost" url={routes.database.maps.id({ id: itemId })} />
			</Suspense>
			<PreviewLink itemType="maps" data={data}>
				<PreviewImage itemType="maps" data={data} />
				<PreviewHeader>{name}</PreviewHeader>
			</PreviewLink>
			<PreviewFooter>{children}</PreviewFooter>
		</PreviewCard>
	);
}
