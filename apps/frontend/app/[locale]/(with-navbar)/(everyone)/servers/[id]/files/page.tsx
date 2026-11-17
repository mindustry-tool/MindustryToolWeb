'use client';

import { MutateButton } from '@/components/buttons/mutate-button';
import JsonDisplay from '@/components/common/json-display';
import { ServerError } from '@/components/server/server-fetch-state';
import { PathSegment } from '@/components/files/path-segment';
import { PreviousPathButton } from '@/components/files/previous-path-button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import {
	byteToString,
	cn,
	getFileExtension,
	getFilename,
	getParentPath,
	isJson,
	normalizePath,
	parseServerFile,
	triggerBlobDownload,
} from '@/lib/utils';
import { api } from '@mindustry-tool/api';
import { FileDto } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	DownloadIcon,
	File,
	FileCode,
	FileImage,
	FileText,
	Folder,
	Loader2,
	Pencil,
	Save,
	SquarePlus,
	Trash,
	X,
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const MAX_OPEN_FILE_SIZE = 5000000;

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const TEXT_EXTENSIONS = ['txt', 'md', 'json', 'hjson', 'xml', 'properties'];
const CODE_EXTENSIONS = ['html', 'css', 'js', 'ts', 'tsx', 'java', 'c', 'cpp', 'py', 'sh'];

const TEXT_BASE_EXTENSIONS = [...TEXT_EXTENSIONS, ...CODE_EXTENSIONS];

export default function Page() {
	return (
		<Suspense>
			<Content />
		</Suspense>
	);
}

function Content() {
	const { id } = useParams<{ id: string }>();
	const [path, setPath] = useQueryState('path', { defaultValue: '/' });
	const queryClient = useQueryClient();

	const normalizedPath = normalizePath(path);
	const ext = getFileExtension(normalizedPath);

	const { data, isError, error, isLoading } = useQuery({
		queryKey: ['servers', id, 'files', normalizedPath],
		queryFn: () =>
			apiInstance.request(api.v4.servers.files.list, {
				params: { id },
				query: { path: normalizedPath },
				responseType: IMAGE_EXTENSIONS.includes(ext) ? 'buffer' : undefined,
			}),
	});

	const parentPath = getParentPath(normalizedPath);
	const parentData = queryClient.getQueryData<unknown>(['servers', id, 'files', parentPath]);
	let itemsCount: number | undefined;
	let isDirectory: boolean | undefined;

	if (parentData) {
		const parsedParent = parseServerFile(parentData);
		if (Array.isArray(parsedParent)) {
			const itemInParent = parsedParent.find((f) => normalizePath(f.path) === normalizedPath);
			if (itemInParent) {
				isDirectory = itemInParent.directory;
				if (isDirectory && 'items' in itemInParent && typeof itemInParent.items === 'number') {
					itemsCount = itemInParent.items;
				}
			}
		}
	}

	const isRoot = normalizedPath === '/';
	const isFile = !isRoot && (isDirectory === false || (isDirectory === undefined && ext !== ''));

	return (
		<div className="h-full flex flex-col overflow-hidden gap-2 p-4">
			<div className="flex flex-col sm:flex-row gap-2 min-w-0 w-full">
				<div className="flex gap-2 min-w-0 flex-1">
					<PreviousPathButton path={path} setPath={setPath} />
					<PathSegment path={path} setPath={setPath} />
				</div>
				<CreateNewFileButton path={path} />
			</div>
			<Separator />
			{isLoading && (isFile ? <FileContentSkeleton /> : <FilesSkeleton number={itemsCount} />)}
			{isError && <ServerError error={error} />}
			{!isLoading &&
				!isError &&
				(data ? (
					<div className="h-full flex flex-col overflow-y-auto">
						<Suspense>
							<Item data={data} path={path} />
						</Suspense>
					</div>
				) : (
					<div className="flex items-center justify-center h-full w-full">
						<Tran className="font-semibold text-xl" text="file.empty" />
					</div>
				))}
		</div>
	);
}

function FileContentSkeleton() {
	return (
		<div className="flex flex-col gap-2 h-full min-h-0 overflow-y-auto">
			<div className="flex justify-between items-center bg-card border px-4 py-2 rounded-md">
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-8 w-20" />
			</div>
			<div className="bg-card border p-4 rounded-md flex-1 min-h-100 flex flex-col gap-3">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-4/5" />
			</div>
		</div>
	);
}

function FilesSkeleton({ number = 15 }: { number?: number }) {
	const count = number && number > 0 ? number : 15;
	return (
		<div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(320px,1fr))] overflow-y-auto">
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="px-2.5 py-2 rounded-sm border bg-card flex gap-2 items-center">
					<Skeleton className="size-6 shrink-0 rounded-sm" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-12 ml-auto" />
				</div>
			))}
		</div>
	);
}

function Item({ path, data }: { data: unknown; path: string }) {
	const file = parseServerFile(data);

	if (file instanceof ArrayBuffer) {
		const ext = getFileExtension(path);
		return <ImageFile content={file} extension={ext} />;
	}

	if (typeof file === 'string') {
		return <TextFileViewerEditor path={path} initialContent={file} />;
	}

	return (
		<div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
			{file
				.sort((a, b) => a.path.localeCompare(b.path))
				.sort((a, b) => (a.directory ? 0 : 1) - (b.directory ? 0 : 1))
				.map((file) => (
					<FileCard key={file.path} file={file} />
				))}
		</div>
	);
}

function TextFileViewerEditor({ path, initialContent }: { path: string; initialContent: string }) {
	const { t } = useI18n('file');
	const { id } = useParams<{ id: string }>();
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(initialContent);
	const queryClient = useQueryClient();

	useEffect(() => {
		setTimeout(() => {
			setContent(initialContent);
		}, 0);
	}, [initialContent]);

	const { mutate: saveFile, isPending: isSaving } = useMutation({
		mutationFn: async (updatedContent: string) => {
			const filename = getFilename(path);
			const blob = new Blob([updatedContent], { type: 'text/plain;charset=utf-8' });
			const formData = new FormData();
			formData.append('data', blob, filename);

			return apiInstance.request(api.v4.servers.files.write, {
				params: { id },
				query: { path: normalizePath(path) },
				body: formData,
			});
		},
		onSuccess: () => {
			toast.success(<Tran text="file.saved" />);
			const normalizedPath = normalizePath(path);
			queryClient.invalidateQueries({ queryKey: ['servers', id, 'files', normalizedPath] });
			queryClient.invalidateQueries({ queryKey: ['servers', id] });
			setIsEditing(false);
		},
		onError: (error: Error) => {
			toast.error(<Tran text="file.save-error" />, {
				description: error.message,
			});
		},
	});

	const isJsonFile = !isEditing && isJson(initialContent);

	return (
		<div className="flex flex-col gap-2 h-full min-h-0">
			<div className="flex justify-between items-center bg-card border px-4 py-2 rounded-md">
				<span className="text-sm font-medium font-mono truncate">{getFilename(path)}</span>
				<div className="flex items-center gap-2">
					{!isEditing ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setContent(initialContent);
								setIsEditing(true);
							}}
						>
							<Pencil className="size-4 mr-1.5" />
							<Tran text="file.edit" />
						</Button>
					) : (
						<>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setContent(initialContent);
									setIsEditing(false);
								}}
								disabled={isSaving}
							>
								<X className="size-4 mr-1.5" />
								<Tran text="file.cancel" />
							</Button>
							<Button size="sm" onClick={() => saveFile(content)} disabled={isSaving}>
								{isSaving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
								<Tran
									text={isSaving ? 'file.saving' : 'file.save'}
								/>
							</Button>
						</>
					)}
				</div>
			</div>

			{isEditing ? (
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="font-mono text-sm leading-relaxed p-4 min-h-125 flex-1 w-full resize-y bg-card border rounded-md"
					placeholder={t('content-placeholder')}
				/>
			) : isJsonFile ? (
				<div className="bg-card border p-4 rounded-md overflow-auto flex-1">
					<JsonDisplay json={isJsonFile} />
				</div>
			) : (
				<pre className="bg-card border p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap flex-1">
					{initialContent}
				</pre>
			)}
		</div>
	);
}

function CreateNewFileButton({ path }: { path: string }) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-sm shrink-0">
					<SquarePlus />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="file.create" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<CreateNewFileForm path={path} onClose={() => setIsOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

function CreateNewFileForm({ path, onClose }: { path: string; onClose: () => void }) {
	const { t } = useI18n('file');
	const { id } = useParams<{ id: string }>();
	const [filename, setFileName] = useState('');
	const queryClient = useQueryClient();

	const onError = (error: Error) => {
		toast.error(<Tran text="error" />, {
			description: error.message,
		});
	};

	const onSuccess = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['servers', id] });
		onClose();
	}, [onClose, id, queryClient]);

	const { mutate: createFolder, isPending: isCreatingServer } = useMutation({
		mutationFn: (path: string) =>
			apiInstance.request(api.v4.servers.files.createFolder, {
				params: { id },
				query: { path },
			}),
		onError,
		onSuccess,
	});

	const { mutate: createFile, isPending: isCreatingFile } = useMutation({
		mutationFn: ({ body, filename }: { filename: string; body: FormData }) =>
			apiInstance.request(api.v4.servers.files.write, {
				params: { id },
				query: { path: `${path}/${filename}` },
				body,
			}),
		onError,
		onSuccess,
	});

	return (
		<div className="flex flex-col gap-4">
			<Input
				type="file"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (!file) {
						return;
					}

					const formData = new FormData();
					formData.append('data', file);
					createFile({ filename: file.name, body: formData });
				}}
			/>
			<Separator />
			<div className="flex gap-2 flex-col">
				<Input
					type="text"
					placeholder={t('enter-filename')}
					value={filename}
					onChange={(e) => setFileName(e.target.value)}
				/>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						onClick={() => createFile({ filename, body: new FormData() })}
						disabled={isCreatingServer || isCreatingFile}
					>
						<Tran text="file.create-new-file" />
					</Button>
					<Button onClick={() => createFolder(`${path}/${filename}`)} disabled={isCreatingServer || isCreatingFile}>
						<Tran text="file.create-new-folder" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function ImageFile({ content, extension }: { content: ArrayBuffer; extension: string }) {
	const url = URL.createObjectURL(new Blob([content], { type: `image/${extension}` }));

	return (
		<div className="bg-card border p-4 rounded-md flex items-center justify-center">
			<Image
				className="w-full h-full rounded-md object-contain"
				src={url}
				alt={''}
				loader={({ src }) => src}
				width={320}
				height={320}
			/>
		</div>
	);
}

function FileCard({ file }: { file: FileDto }) {
	const { path, size, directory } = file;
	const [_, setPath] = useQueryState('path', { defaultValue: '/' });
	const filename = getFilename(path);
	const ext = getFileExtension(path);

	const canOpen =
		directory || ((IMAGE_EXTENSIONS.includes(ext) || TEXT_BASE_EXTENSIONS.includes(ext)) && size <= MAX_OPEN_FILE_SIZE);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={cn('px-2.5 py-2 text-sm rounded-sm border bg-card flex gap-2 items-center', {
						'cursor-pointer hover:bg-muted': canOpen,
					})}
					onClick={() => canOpen && setPath(file.path)}
				>
					{directory ? (
						<Folder className="text-yellow-400 size-6 shrink-0" />
					) : CODE_EXTENSIONS.includes(ext) ? (
						<FileCode className="text-purple-500 size-6 shrink-0" />
					) : IMAGE_EXTENSIONS.includes(ext) ? (
						<FileImage className="size-6 shrink-0" />
					) : TEXT_EXTENSIONS.includes(ext) ? (
						<FileText className="size-6 shrink-0" />
					) : (
						<File className="size-6 shrink-0" />
					)}
					<span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">{filename}</span>
					{size > 0 && !directory && (
						<span className="text-muted-foreground ml-auto mr-1 text-nowrap">{byteToString(size)}</span>
					)}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<DeleteDialog path={path} />
				{!directory && <DownloadButton path={path} />}
			</ContextMenuContent>
		</ContextMenu>
	);
}

function DownloadButton({ path }: { path: string }) {
	const { id } = useParams<{ id: string }>();

	const handleDownload = useCallback(() => {
		const filename = getFilename(path) || 'file';

		const downloadPromise = (async () => {
			const response = await apiInstance.request(api.v4.servers.files.download, {
				params: { id },
				query: { path },
				responseType: 'raw',
			});

			const blob = await response.blob();
			triggerBlobDownload(blob, filename);
		})();

		toast.promise(downloadPromise, {
			loading: <Tran text="file.downloading" />,
			success: <Tran text="file.downloaded" />,
			error: (error: Error) => error.message || <Tran text="error" />,
		});
	}, [id, path]);

	return (
		<Button className="w-full min-w-60 justify-start" variant="command" onClick={handleDownload}>
			<DownloadIcon />
			<Tran text="file.download" />
		</Button>
	);
}
function DeleteDialog({ path }: { path: string }) {
	const { id } = useParams<{ id: string }>();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="w-full min-w-60 justify-start" variant="command-destructive">
					<Trash />
					<Tran text="file.delete" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="file.delete" />
				</AlertDialogTitle>
				<VisuallyHidden>
					<AlertDialogDescription />
				</VisuallyHidden>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<MutateButton
						queryKey={['servers', id]}
						mutationKey={[path]}
						mutationFn={() =>
							apiInstance.request(api.v4.servers.files.delete, {
								params: { id },
								query: { path },
							})
						}
					>
						<Tran text="file.delete" />
					</MutateButton>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
