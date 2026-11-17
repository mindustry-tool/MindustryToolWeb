import { api } from '@mindustry-tool/api';
import { imageQuerySchema, paginationQuerySchema } from '@mindustry-tool/api';

import { useQueryClient } from '@tanstack/react-query';
import { Folder } from 'lucide-react';
import NextImage from 'next/image';
import { useQueryState } from 'nuqs';
import React, { Fragment, Suspense, useCallback, useState } from 'react';

import { SearchInput } from '@/components/common/search-input';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import {
	DropZoneContent,
	ImageUploadDragArea,
	ImageUploadPreview,
} from '@/components/forms/media-upload-dropzone';
import { useFileUpload, type UploadOptions } from '@/hooks/use-file-upload';
import { Tran } from '@/i18n/tran';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type { UploadOptions, FileItem } from '@/hooks/use-file-upload';

const MY_MEDIA_QUERY_KEY = ['my-media'];
const IMAGES_QUERY_KEY = ['images'];

type MediaUploadFormProps = {
	handleAdd: (images: UploadedImage[]) => void;
} & UploadOptions;

export type UploadedImage = {
	url: string;
	name: string;
	width: number;
	height: number;
};

export function MediaUploadForm({
	maxSize,
	limit,
	accept,
	upload,
	onSuccess,
	onError,
	handleAdd,
}: MediaUploadFormProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const query = useQueryClient();

	const uploadOptions: UploadOptions = {
		maxSize,
		limit,
		accept,
		upload,
		onSuccess,
		onError,
	};

	const { fileItems, uploadFiles, removeFileItem, clearAllFiles } = useFileUpload(uploadOptions);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) {
			onError?.(new Error('No file selected'));
			return;
		}
		handleUploadLocal(Array.from(files));
	};

	const handleUploadLocal = async (files: File[]) => {
		const images = await uploadFiles(files);
		query.invalidateQueries({ queryKey: ['medias'] });

		handleAdd(images);
	};

	const handleClick = () => {
		if (inputRef.current && fileItems.length === 0) {
			inputRef.current.value = '';
			inputRef.current.click();
		}
	};

	const handleUploadCloud = (image: UploadedImage) => handleAdd([image]);

	const hasFiles = fileItems.length > 0;

	return (
		<Fragment>
			{!hasFiles && (
				<Suspense>
					<Tabs className="rounded-lg bg-card p-2" defaultValue="cloud">
						<TabsList>
							<TabsTrigger value="cloud">
								<Tran text="image.upload-from-cloud" />
							</TabsTrigger>
							<ClientProtectedElement filter="god">
								<TabsTrigger value="shared">
									<Tran text="image.upload-from-shared" />
								</TabsTrigger>
							</ClientProtectedElement>
							<TabsTrigger value="local">
								<Tran text="image.upload-from-local" />
							</TabsTrigger>
						</TabsList>
						<TabsContent value="cloud">
							<ImageSelectFromCloud onSelect={handleUploadCloud} />
						</TabsContent>
						<ClientProtectedElement filter="god">
							<TabsContent value="shared">
								<ImageSelectFromShared onSelect={handleUploadCloud} />
							</TabsContent>
						</ClientProtectedElement>
						<TabsContent value="local">
							<ImageUploadDragArea onClick={handleClick} onFile={handleUploadLocal}>
								<DropZoneContent maxSize={maxSize} limit={limit} />
							</ImageUploadDragArea>
						</TabsContent>
					</Tabs>
				</Suspense>
			)}

			{hasFiles && (
				<div className="flex w-full flex-col gap-2 rounded-lg border p-2 text-base">
					{fileItems.length > 1 && (
						<div className="flex items-center justify-between">
							<span>
								Uploading
								{fileItems.length} files
							</span>
							<Button
								type="button"
								variant="destructive"
								onClick={(e) => {
									e.stopPropagation();
									clearAllFiles();
								}}
							>
								Clear All
							</Button>
						</div>
					)}
					{fileItems.map((fileItem) => (
						<ImageUploadPreview key={fileItem.id} fileItem={fileItem} onRemove={() => removeFileItem(fileItem.id)} />
					))}
				</div>
			)}

			<input
				className="hidden"
				ref={inputRef}
				name="file"
				accept={accept}
				type="file"
				multiple={limit > 1}
				onChange={handleChange}
				onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
			/>
		</Fragment>
	);
}

const ImageSelectFromCloud: React.FC<{ onSelect: (url: UploadedImage) => void }> = ({ onSelect }) => {
	return (
		<div className="h-[50vh] max-h-[50vh] overflow-y-auto rounded-sm">
			<InfiniteApiItem
				className="columns-2 gap-2 [column-fill:balance] sm:columns-3 md:columns-4"
				route={api.v4.media.getMy}
				queryKey={MY_MEDIA_QUERY_KEY}
				query={paginationQuerySchema}
				loading={() => (
					<>
						<Skeleton className="mb-2 h-96 w-full rounded-md" />
						<Skeleton className="mb-2 h-32 w-full rounded-md" />
						<Skeleton className="mb-2 h-64 w-full rounded-md" />
						<Skeleton className="mb-2 h-32 w-full rounded-md" />
						<Skeleton className="mb-2 h-80 w-full rounded-md" />
						<Skeleton className="mb-2 h-64 w-full rounded-md" />
					</>
				)}
			>
				{(pages) =>
					pages
						.flatMap((page) => page)
						.map((item) => (
							<div key={item.id} className="not-prose mb-2 h-auto break-inside-avoid">
								<NextImage
									className="h-auto w-full rounded-md border"
									onClick={() => onSelect(item)}
									width={256}
									height={256}
									src={item.url}
									alt={item.url.split('/').pop() || 'unknown'}
								/>
							</div>
						))
				}
			</InfiniteApiItem>
		</div>
	);
};

const ImageSelectFromShared: React.FC<{ onSelect: (url: UploadedImage) => void }> = ({ onSelect }) => {
	const [path, setPath] = useState<{ name: string; id: string }[]>([]);
	const parentId = path[path.length - 1]?.id || null;

	const setParentId = useCallback(
		(data: { id: string; name: string }) => {
			const index = path.findIndex((item) => item.id === data.id);
			if (index === -1) {
				setPath((prev) => [...prev, data]);
			} else {
				setPath((prev) => [...prev.slice(0, index), data]);
			}
		},
		[path],
	);

	const [q, setQ] = useQueryState('q', {
		defaultValue: '',
	});

	return (
		<div className="not-prose flex flex-col gap-2">
			<SearchInput className="mr-auto" value={q} onChange={setQ} />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem onClick={() => setPath([])}>
						<Tran text="root" />
					</BreadcrumbItem>
					{path.length > 0 && <BreadcrumbSeparator />}
					{path.map((item, index) => (
						<Fragment key={item.id}>
							{index === path.length - 1 ? (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							) : (
								<BreadcrumbItem onClick={() => setParentId(item)}>{item.name}</BreadcrumbItem>
							)}
							{index < path.length - 1 && <BreadcrumbSeparator />}
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
			<Separator />
			<InfiniteApiItem
				className="flex h-full flex-wrap gap-2 overflow-y-auto"
				route={api.v4.images.get}
				queryKey={IMAGES_QUERY_KEY}
				query={[imageQuerySchema, { parentId }]}
			>
				{(pages) =>
					pages
						.flatMap((page) => page)
						.map((item) => (
							<div
								key={item.id}
								className="flex w-32 animate-in flex-col gap-2 overflow-hidden rounded-md border bg-card p-1 fade-in"
							>
								{item.url ? (
									<NextImage
										className="w-32 rounded-md object-top"
										width={item.width}
										height={item.height}
										src={item.url}
										alt={item.name}
										onClick={() => onSelect({ ...item, url: item.url! })}
									/>
								) : (
									<Folder className="h-32 w-auto" onClick={() => setParentId(item)} />
								)}
								<span className="mt-auto text-center text-xs text-ellipsis text-muted-foreground">{item.name}</span>
							</div>
						))
				}
			</InfiniteApiItem>
		</div>
	);
};
