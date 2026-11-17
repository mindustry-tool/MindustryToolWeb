import type { ControllerFieldState } from 'react-hook-form';
import type { UploadedImage } from '@/components/forms/media-upload.form';
import { X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { MediaUploadForm } from '@/components/forms/media-upload.form';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/image-upload';
import { cn } from '@/lib/utils';

type ImageSelectFormProps = {
	value?: string | null;
	onChange: (value: UploadedImage | null) => void;
	fieldState: ControllerFieldState;
	width: number;
	height: number;
	limit?: number;
};

export function ImageSelectForm({ limit, value, onChange, fieldState, width, height }: ImageSelectFormProps) {
	if (value) {
		return (
			<div className="relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-md">
				<Image
					className="h-full w-full rounded-md border object-cover"
					src={value}
					alt=""
					width={width}
					height={height}
					style={{ width: '100%', height: '100%' }}
				/>
				<div className="flex gap-2">
					<Button className="ml-auto" type="button" variant="destructive" onClick={() => onChange(null)}>
						<X className="text-destructive-foreground" size={16} />
						<Tran text="unselect-image" />
					</Button>
					<DialogClose asChild>
						<Button>
							<Tran text="accept" />
						</Button>
					</DialogClose>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn('overflow-hidden', {
				'border-destructive': fieldState.invalid,
			})}
		>
			<MediaUploadForm
				accept="image/*"
				limit={limit || 1}
				maxSize={MAX_FILE_SIZE}
				upload={handleImageUpload}
				onError={(error) =>
					toast.error(<Tran text="image.upload-fail" />, {
						description: error.message,
					})
				}
				handleAdd={(url) => onChange(url[0]!)}
			/>
		</div>
	);
}
