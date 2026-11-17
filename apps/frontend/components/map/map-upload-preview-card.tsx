import type { MapDto } from '@mindustry-tool/api';
import { Check, X } from 'lucide-react';
import { DownloadButton } from '@/components/buttons/download-button';
import { MapPreviewCard } from '@/components/map/map-preview-card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import VerifyMapDialog from '@/components/map/verify-map-dialog';
import { RejectItemDialog } from '@/components/item/reject-item-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const MAPS_QUERY_KEY = ['maps'];

type MapPreviewCardProps = {
	data: MapDto;
};

export function MapUploadPreviewCard({ data }: MapPreviewCardProps) {
	const targetId = data.itemId ?? data.id;

	return (
		<MapPreviewCard data={data}>
			<DownloadButton queryKey={MAPS_QUERY_KEY} itemType="maps" data={data} />
			<RejectItemDialog
				id={targetId}
				itemType="maps"
				queryKey={MAPS_QUERY_KEY}
				trigger={
					<Button variant="outline">
						<X className="size-4" />
					</Button>
				}
			/>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<Check />
					</Button>
				</DialogTrigger>
				<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
					<VisuallyHidden>
						<DialogHeader className="gap-0.5 pb-1">
							<DialogTitle className="text-base font-semibold">
								<Tran text="verify.map" />
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								<Tran text="map.verify-map-desc" />
							</DialogDescription>
						</DialogHeader>
					</VisuallyHidden>
					<VerifyMapDialog data={data} />
				</DialogContent>
			</Dialog>
		</MapPreviewCard>
	);
}
