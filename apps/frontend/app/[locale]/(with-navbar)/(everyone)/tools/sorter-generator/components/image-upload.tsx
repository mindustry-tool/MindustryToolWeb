import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

type ImageUploadProps = {
	onImageSelected: (file: File) => void;
	className?: string;
};

export function ImageUpload({ onImageSelected, className }: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const files = Array.from(e.dataTransfer.files);
			const imageFile = files.find((file) => file.type.startsWith('image/'));

			if (imageFile) {
				onImageSelected(imageFile);
			}
		},
		[onImageSelected],
	);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				onImageSelected(file);
			}
		},
		[onImageSelected],
	);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div
			className={cn(
				'relative flex min-h-75 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-primary hover:bg-accent',
				isDragging && 'border-primary bg-accent',
				className,
			)}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={handleClick}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileInput}
				aria-label="Upload image"
			/>

			<Upload className="h-12 w-12 text-muted-foreground" />
		</div>
	);
}
