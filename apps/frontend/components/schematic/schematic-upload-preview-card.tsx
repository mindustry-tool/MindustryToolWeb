import type { SchematicDto } from '@mindustry-tool/api';
import { Check, X } from 'lucide-react';
import { DownloadButton } from '@/components/buttons/download-button';
import { SchematicCopyButton } from '@/components/schematic/schematic-copy-button';
import { SchematicPreviewCard } from '@/components/schematic/schematic-preview-card';
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
import VerifySchematicDialog from '@/components/schematic/verify-schematic-dialog';
import { RejectItemDialog } from '@/components/item/reject-item-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type SchematicPreviewCardProps = {
	data: SchematicDto;
};

const queryKey = ['schematics'];

export function SchematicUploadPreviewCard({ data }: SchematicPreviewCardProps) {
	const targetId = data.itemId ?? data.id;

	return (
		<SchematicPreviewCard data={data}>
			<DownloadButton queryKey={queryKey} itemType="schematics" data={data} />
			<SchematicCopyButton data={data} />
			<RejectItemDialog
				id={targetId}
				itemType="schematics"
				queryKey={queryKey}
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
								<Tran text="verify.schematic" />
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								<Tran text="schematic.verify-schematic-desc" />
							</DialogDescription>
						</DialogHeader>
					</VisuallyHidden>
					<VerifySchematicDialog data={data} />
				</DialogContent>
			</Dialog>
		</SchematicPreviewCard>
	);
}
