'use client';

import type { ApiResult } from '@mindustry-tool/api';
import type { ItemTagDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	AlertCircle,
	ClipboardPaste,
	FileCode,
	RotateCcw,
	Tag,
	Upload,
} from 'lucide-react';

import ColorText from '@/components/common/color-text';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { TagCard } from '@/components/tag/tag-card';
import { TagIdSelector } from '@/components/tag/tag-id-selector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import { NetPower } from '@/components/schematic/net-power';

export default function UploadSchematicDialog() {
	const [preview, setPreview] = useState<ApiResult<typeof api.v4.schematics.preview>>();
	const [image, setImage] = useState<ApiResult<typeof api.v4.schematics.image>>();
	const [formData, setFormData] = useState<FormData>();
	const [isDragging, setIsDragging] = useState(false);
	const [manualCode, setManualCode] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		mutate,
		isPending: isPreviewPending,
		isError,
		error,
		reset: resetPreviewMutation,
	} = useMutation({
		mutationFn: (data: FormData) =>
			apiInstance.request(api.v4.schematics.preview, {
				body: data,
				timeout: 180_000,
			}),
		onSuccess(data) {
			setPreview(data);
		},
	});

	const {
		mutate: mutateImage,
		isError: isImageError,
		error: imageError,
		reset: resetImageMutation,
	} = useMutation({
		mutationFn: (data: FormData) =>
			apiInstance.request(api.v4.schematics.image, {
				body: data,
				responseType: 'buffer',
				timeout: 180_000,
			}),
		onSuccess(data) {
			setImage(data);
		},
	});

	const handleReset = useCallback(() => {
		setPreview(undefined);
		setImage(undefined);
		setFormData(undefined);
		setManualCode('');
		resetPreviewMutation();
		resetImageMutation();
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [resetPreviewMutation, resetImageMutation]);

	const processFile = useCallback(
		(file: File) => {
			if (!file.name.endsWith('.msch')) {
				toast.error(
					<Tran
						text="schematic.error-invalid-file-extension"
					/>,
				);
				return;
			}

			const data = new FormData();
			data.append('file', file);

			mutate(data);
			mutateImage(data);
			setFormData(data);
		},
		[mutate, mutateImage],
	);

	const processSchematicText = useCallback(
		(rawText: string) => {
			const text = rawText.trim();
			if (!text) {
				toast.error(<Tran text="schematic.error-empty-clipboard" />);
				return;
			}

			if (!text.startsWith('bXNjaA')) {
				toast.error(
					<Tran
						text="schematic.error-invalid-schematic-data"
					/>,
				);
				return;
			}

			const data = new FormData();
			data.append('data', text);

			mutate(data);
			mutateImage(data);
			setFormData(data);
		},
		[mutate, mutateImage],
	);

	const handleCopyFromClipboard = useCallback(async () => {
		try {
			const text = await navigator.clipboard.readText();
			processSchematicText(text);
		} catch (err) {
			toast.error(
				<Tran
					text="schematic.error-clipboard-read"
				/>,
				{
					description: String(err),
				},
			);
		}
	}, [processSchematicText]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		processFile(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	// Global paste listener: user can focus the dialog and press Ctrl+V
	useEffect(() => {
		if (preview || isPreviewPending) return;

		function handleGlobalPaste(e: ClipboardEvent) {
			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
				return;
			}

			if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
				const file = e.clipboardData.files[0];
				if (file?.name.endsWith('.msch')) {
					e.preventDefault();
					processFile(file);
					return;
				}
			}

			const text = e.clipboardData?.getData('text')?.trim();
			if (text && text.startsWith('bXNjaA')) {
				e.preventDefault();
				processSchematicText(text);
			}
		}

		window.addEventListener('paste', handleGlobalPaste);
		return () => {
			window.removeEventListener('paste', handleGlobalPaste);
		};
	}, [preview, isPreviewPending, processFile, processSchematicText]);

	// Loading state: Compact, clean decoding indicator
	if (isPreviewPending) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
				<LoadingSpinner className="size-6 text-foreground/80" />
				<div className="space-y-0.5">
					<p className="text-sm font-medium text-foreground"><Tran text="schematic.decoding" /></p>
					<p className="text-xs text-muted-foreground"><Tran text="schematic.parsing-blocks" /></p>
				</div>
			</div>
		);
	}

	// Error state during preview generation
	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-8 px-2 text-center">
				<AlertCircle className="size-6 text-destructive" />
				<div className="space-y-1 max-w-sm">
					<p className="text-sm font-medium text-foreground"><Tran text="schematic.failed-to-parse" /></p>
					<ErrorMessage error={error} />
				</div>
				<Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs gap-1.5 mt-1">
					<RotateCcw className="size-3.5" />
					<Tran text="schematic.reset" />
				</Button>
			</div>
		);
	}

	// Preview & Verification state
	if (preview && formData) {
		return (
			<PreviewDialog
				preview={preview}
				image={image}
				reset={handleReset}
				isError={isImageError}
				error={imageError}
				formData={formData}
			/>
		);
	}

	// Initial Ingestion View: Purposeful drop area + quiet alternative input
	return (
		<div className="space-y-3 pt-1">
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				id="schematic-file"
				className="hidden"
				type="file"
				accept=".msch"
				onChange={handleFileChange}
			/>

			{/* Medium-sized, purposeful drop area */}
			<div
				onDragOver={handleDragOver}
				onDragEnter={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
				className={cn(
					'relative flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed py-6 px-4 text-center transition-colors cursor-pointer select-none',
					isDragging
						? 'border-primary bg-primary/5 text-primary'
						: 'border-border/70 bg-muted/20 hover:border-border hover:bg-muted/30 text-muted-foreground',
				)}
			>
				<Upload className="size-5 text-foreground/70" />

				<div className="space-y-0.5">
					<p className="text-sm font-medium text-foreground">
						<Tran text="schematic.drop-here" />
					</p>
					<p className="text-xs text-muted-foreground font-mono">
						<Tran text="schematic.msch-supported" />
					</p>
				</div>

				<div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
					<Button
						type="button"
						size="sm"
						variant="outline"
						className="h-7 text-xs font-normal"
						onClick={() => fileInputRef.current?.click()}
					>
						<FileCode className="size-3.5" />
						<Tran text="schematic.upload-file" />
					</Button>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						className="h-7 text-xs font-normal"
						onClick={handleCopyFromClipboard}
					>
						<ClipboardPaste className="size-3.5" />
						<Tran text="schematic.copy-from-clipboard" />
					</Button>
				</div>

				<p className="text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1 pt-0.5">
					<span><Tran text="schematic.tip-paste" /></span>
					<kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground">
						Ctrl + V
					</kbd>
					<span><Tran text="schematic.to-paste-while-open" /></span>
				</p>
			</div>

			{/* Clean technical separator */}
			<div className="relative my-2 flex items-center justify-center">
				<div className="w-full border-t border-border/50" />
				<span className="absolute bg-background px-2.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/60">
					<Tran text="schematic.or-paste-string" />
				</span>
			</div>

			{/* Alternative Input Workflow */}
			<div className="relative">
				<Textarea
					placeholder="Paste schematic string (starts with bXNjaA...)"
					value={manualCode}
					onChange={(e) => {
						setManualCode(e.target.value);
						if (e.target.value.trim().startsWith('bXNjaA')) {
							processSchematicText(e.target.value);
						}
					}}
					rows={2}
					className="font-mono text-xs resize-none bg-muted/15 border-border/70 focus-visible:ring-1 pr-22 text-foreground placeholder:text-muted-foreground/50 min-h-16"
				/>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					disabled={!manualCode.trim()}
					onClick={() => processSchematicText(manualCode)}
					className="absolute bottom-2 right-2 h-7 px-2.5 text-xs font-medium"
				>
					<Tran text="schematic.decode" />
				</Button>
			</div>
		</div>
	);
}

function PreviewDialog({
	preview,
	image,
	isError,
	error,
	formData,
	reset,
}: {
	preview: ApiResult<typeof api.v4.schematics.preview>;
	image?: ApiResult<typeof api.v4.schematics.image>;
	isError: boolean;
	error?: unknown;
	formData: FormData;
	reset: () => void;
}) {
	const { name, description, width, height, mod, meta } = preview;
	const [tags, setTags] = useState<ItemTagDto[]>([]);
	const [imageUrl, setImageUrl] = useState<string>('');
	const router = useRouter();

	useEffect(() => {
		if (!image) return;
		const blob = new Blob([image]);
		const url = URL.createObjectURL(blob);
		setTimeout(() => setImageUrl(url), 0);

		return () => {
			URL.revokeObjectURL(url);
		};
	}, [image]);

	const {
		mutate,
		isPending: isUploadPending,
		isError: isUploadError,
		error: uploadError,
	} = useMutation({
		mutationFn: async (data: FormData) => {
			tags.forEach((tag) => data.append('tags[]', tag.id));

			return await apiInstance.request(api.v4.schematics.upload, {
				body: data,
				timeout: 180_000,
			});
		},
		onSuccess: (data) => {
			toast.success(<Tran text="schematic.upload-success" />);
			router.push(routes.database.schematics.id({ id: data.itemId ?? data.id }));
		},
	});

	function handleUpload() {
		mutate(formData);
	}

	return (
		<div className="flex flex-col gap-3 pt-1">
			{isUploadError && <ErrorMessage error={uploadError} />}

			{/* Schematic Viewport */}
			<div className="relative flex aspect-video max-h-50 w-full items-center justify-center overflow-hidden rounded-md border border-border/70 bg-black/40">
				{mod && (
					<div className="absolute top-2 left-2 z-20">
						<span className="rounded border border-border/60 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
							<Tran text="common.mod-prefix" /> {mod}
						</span>
					</div>
				)}
				<div className="absolute top-2 right-2 z-20">
					<span className="rounded border border-border/60 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
						{width} × {height}
					</span>
				</div>

				{imageUrl ? (
					<Image
						className="relative z-10 max-h-45 w-auto max-w-full object-contain"
						src={imageUrl}
						alt={name}
						width={width * 32}
						height={height * 32}
						unoptimized
					/>
				) : isError ? (
					<div className="relative z-10 flex flex-col items-center gap-1 text-xs text-destructive p-3 text-center">
						<AlertCircle className="size-4" />
						<span><Tran text="schematic.failed-to-generate-image" /></span>
						{error ? <ErrorMessage className="p-0 text-xs" error={error} /> : null}
					</div>
				) : (
					<div className="relative z-10 flex flex-col items-center gap-2 text-muted-foreground">
						<LoadingSpinner className="size-5 text-muted-foreground" />
						<span className="text-xs font-mono text-muted-foreground/70"><Tran text="schematic.rendering" /></span>
					</div>
				)}
			</div>

			{/* Title & Description */}
			<div className="space-y-0.5">
				<h2 className="text-base font-semibold tracking-tight text-foreground wrap-break-word">
					<ColorText text={name} />
				</h2>
				{description && (
					<p className="text-xs text-muted-foreground leading-normal whitespace-pre-wrap max-h-16 overflow-y-auto">
						<ColorText text={description} />
					</p>
				)}
			</div>

			{/* Technical Specs Strip */}
			<div className="grid grid-cols-3 divide-x divide-border/60 rounded-md border border-border/70 bg-muted/15 py-1.5 text-center">
				<div className="px-2">
					<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="dimensions" /></div>
					<div className="font-mono text-xs font-semibold text-foreground mt-0.5">{width} × {height}</div>
				</div>
				<div className="px-2">
					<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="power-balance" /></div>
					<div className="mt-0.5 text-xs">
						<NetPower powerProduction={meta.powerProduction} powerConsumption={meta.powerConsumption} />
					</div>
				</div>
				<div className="px-2">
					<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="blocks" /></div>
					<div className="font-mono text-xs font-semibold text-foreground mt-0.5">{meta.blocks?.length ?? 0}</div>
				</div>
			</div>

			{/* Bill of Materials (Requirements) */}
			{meta.requirements.length > 0 && (
				<div className="space-y-1.5">
					<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
						<Tran text="schematic.requirements" />
					</div>
					<div className="flex flex-wrap gap-1.5">
						{meta.requirements.map(({ name, amount, color }) => (
							<div
								key={name}
								className="inline-flex items-center gap-1 rounded border border-border/60 bg-muted/20 px-2 py-0.5 text-xs"
							>
								<Image
									className="size-3.5 shrink-0 object-contain"
									width={14}
									height={14}
									src={`https://content.mindustry-tool.com/api/v2/items/${name}/image.png`}
									alt={name}
								/>
								<span className="capitalize text-muted-foreground text-[11px]">{name.replace(/-/g, ' ')}</span>
								<span className="font-mono text-[11px] font-medium" style={{ color: color || undefined }}>
									{amount.toLocaleString()}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Tags Station */}
			<div className="space-y-1.5 pt-0.5">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
						<Tran text="tags" />
					</span>
					<TagIdSelector returnType="dto" type="schematics" value={tags} onValueChange={setTags}>
						<Button variant="outline" size="sm" className="h-6 px-2 text-[11px] font-normal">
							<Tag className="size-3 mr-1" />
							{tags.length > 0 ? <Tran text="tags.edit-tags" /> : <Tran text="tags.select-tags-btn" />}
						</Button>
					</TagIdSelector>
				</div>
				{tags.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{tags.map((tag) => (
							<TagCard
								key={tag.id}
								tag={tag}
								onClick={() => setTags((prev) => prev.filter((t) => t.id !== tag.id))}
							/>
						))}
					</div>
				) : (
					<p className="text-[11px] text-muted-foreground/70">
						<Tran text="tags.no-tags-assigned" />
					</p>
				)}
			</div>

			{/* Footer Actions */}
			<div className="flex items-center justify-between gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={reset}
					className="h-8 text-xs text-muted-foreground hover:text-foreground"
				>
					<RotateCcw className="size-3.5 mr-1" />
					<Tran text="schematic.reset" />
				</Button>
				<Button
					type="button"
					size="sm"
					onClick={handleUpload}
					disabled={isUploadPending}
					className="h-8 px-4 text-xs font-medium"
				>
					{isUploadPending ? (
						<>
							<LoadingSpinner className="size-3.5 mr-1" />
							<span><Tran text="common.uploading" /></span>
						</>
					) : (
						<>
							<Upload className="size-3.5 mr-1" />
							<Tran text="upload" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
