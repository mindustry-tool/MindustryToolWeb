import React from 'react';
import { CloseIcon } from '@/components/icons/close-icon';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import type { FileItem } from '@/hooks/use-file-upload';

export const CloudUploadIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M4.33333 13H3.66667C2.19391 13 1 11.8061 1 10.3333C1 8.97548 2.01878 7.8559 3.36647 7.68481C3.4542 5.37894 5.36444 3.53333 7.69999 3.53333C9.91494 3.53333 11.7501 5.19799 12.0075 7.3627C13.1365 7.67449 13.9667 8.70685 13.9667 9.93333C13.9667 11.4061 12.7728 12.6 11.3 12.6H11"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M5.5 10.5L7.66667 8.33333L9.83333 10.5"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M7.66667 8.33333V14"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const FileIcon = () => (
	<svg
		width="48"
		height="48"
		viewBox="0 0 48 48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M8 8C8 5.79086 9.79086 4 12 4H28.6863C29.7472 4 30.7646 4.42143 31.5147 5.17157L38.8284 12.4853C39.5786 13.2354 40 14.2528 40 15.3137V40C40 42.2091 38.2091 44 36 44H12C9.79086 44 8 42.2091 8 40V8Z"
			fill="#E2E8F0"
		/>
	</svg>
);

export const FileCornerIcon = () => (
	<svg
		width="10"
		height="11"
		viewBox="0 0 10 11"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
			fill="currentColor"
		/>
	</svg>
);

export type ImageUploadDragAreaProps = {
	onFile: (files: File[]) => void;
	onClick: () => void;
	children?: React.ReactNode;
};

export const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = ({ onFile, onClick, children }) => {
	const [isDragOver, setIsDragOver] = React.useState(false);
	const [isDragActive, setIsDragActive] = React.useState(false);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragActive(false);
			setIsDragOver(false);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
		setIsDragOver(false);

		const files = Array.from(e.dataTransfer.files);
		if (files.length > 0) {
			onFile(files);
		}
	};

	return (
		<div
			className={`${isDragActive ? 'drag-active' : ''} ${isDragOver ? 'drag-over' : ''}`}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export type ImageUploadPreviewProps = {
	fileItem: FileItem;
	onRemove: () => void;
};

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ fileItem, onRemove }) => {
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<div className="relative flex flex-col gap-2 overflow-hidden rounded-lg border bg-card p-2">
			{fileItem.status === 'uploading' && (
				<div
					className="absolute top-0 bottom-0 left-0 h-full bg-primary/50"
					style={{ width: `${fileItem.progress}%` }}
				/>
			)}

			<div className="z-10 flex w-full items-center gap-2">
				<div className="relative flex items-center gap-2">
					<div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<CloudUploadIcon />
					</div>
					<div className="flex flex-col">
						<span className="text-foreground">{fileItem.file.name}</span>
						<span className="text-sm text-muted-foreground">{formatFileSize(fileItem.file.size)}</span>
					</div>
				</div>
				<div className="ml-auto flex items-center gap-3">
					{fileItem.status === 'uploading' && <span className="font-semibold text-primary">{fileItem.progress}%</span>}
					<Button
						type="button"
						variant="secondary"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
					>
						<CloseIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};

export const DropZoneContent: React.FC<{ maxSize: number; limit: number }> = ({ maxSize, limit }) => (
	<div className="flex h-full min-h-60 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors hover:border-primary">
		<div className="relative">
			<FileIcon />
			<div className="absolute top-0 right-0">
				<FileCornerIcon />
			</div>
			<div className="absolute right-0 bottom-0 flex aspect-square size-8 translate-x-1 translate-y-1 items-center justify-center rounded-xl bg-primary text-primary-foreground">
				<CloudUploadIcon />
			</div>
		</div>
		<div className="flex flex-col items-center text-sm">
			<span>
				<span className="underline"><Tran text="click-to-upload" /></span> or drag and drop
			</span>
			<span className="text-muted-foreground">
				Maximum {limit} file
				{limit === 1 ? '' : 's'}, {maxSize / 1024 / 1024}
				MB each.
			</span>
		</div>
	</div>
);
