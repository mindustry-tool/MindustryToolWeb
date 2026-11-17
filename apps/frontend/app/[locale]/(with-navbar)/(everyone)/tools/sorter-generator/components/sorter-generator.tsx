/* eslint-disable react-hooks/refs */
'use client';

import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/common/page-wrapper';
import { Tran } from '@/i18n/tran';
import { Loader2, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/i18n.client';
import { toast } from 'sonner';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Shared components
import { ImageUpload } from '@/components/tools/ImageUpload';
import { CopyDialog } from '@/components/tools/CopyDialog';
import { SchematicActions } from '@/components/tools/SchematicActions';
import { ProcessingOverlay } from '@/components/tools/ProcessingOverlay';
import { OutputInfoPanel } from '@/components/tools/OutputInfoPanel';

// Local components
import { SettingsPanel } from './settings-panel';
import { AdvancedSettings } from './advanced-settings';

// Shared hooks & types
import { useSchematicFiles, type SchematicFile } from '@/lib/tools';

// Libs
import { drawPixelGrid, useImageWorker } from '@/lib/image-processing';
import { MINDUSTRY_MATERIALS } from '../lib/materials';
import { SchematicWriter } from '../lib/schematic-writer';
import type { GeneratorSettings, PixelGrid, PixelGridCell } from '../lib/types';
import environment from '@/config/environment';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';

const DEFAULT_SETTINGS: GeneratorSettings = {
	blockType: 'sorter',
	blockSize: 5,
	splitVertical: 1,
	splitHorizontal: 1,
	dithering: false,
	advancedDithering: false,
	advancedDitheringSettings: DEFAULT_DITHERING_SETTINGS,
};

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect?: number) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: '%',
				width: 100,
			},
			aspect || mediaWidth / mediaHeight,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	);
}

export default function SorterGenerator() {
	const { t } = useI18n('generator-sorter');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [selectedMaterials, setSelectedMaterials] = useState<string[]>(MINDUSTRY_MATERIALS.map((m) => m.name));
	const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS);

	// Crop states
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const imgRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState<number>(0);

	// Keep a ref to settings to access latest value in useEffect without triggering re-runs
	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	const [pixelGrid, setPixelGrid] = useState<PixelGrid | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [previewImageBlob, setPreviewImageBlob] = useState<Blob | null>(null);
	const [showSchematicPreview, setShowSchematicPreview] = useState(false);
	const [canvasReady, setCanvasReady] = useState(false);

	// Use shared schematic files hook
	const {
		schematicFiles,
		setSchematicFiles,
		showCopyDialog,
		setShowCopyDialog,
		handleDownload,
		handleCopy,
		handleCopyClick,
	} = useSchematicFiles();

	// Initialize worker for non-blocking image processing
	const {
		processImage: processImageWithWorker,
		isProcessing: isWorkerProcessing,
		progress: workerProgress,
		currentStep: workerStep,
		stepMessage: workerMessage,
		result: workerResult,
		error: workerError,
		cancel: cancelWorker,
	} = useImageWorker({ debounceMs: 500 });

	const originalCanvasRef = useRef<HTMLCanvasElement>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Track container size for crop calculations
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width } = entry.contentRect;
				setContainerSize(width);
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	const onImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { naturalWidth, naturalHeight } = e.currentTarget;

			if (containerSize === 0) return;

			// Calculate display dimensions
			const imageRatio = naturalWidth / naturalHeight;
			let displayWidth: number;
			let displayHeight: number;

			if (imageRatio > 1) {
				// Landscape
				displayWidth = containerSize;
				displayHeight = containerSize / imageRatio;
			} else {
				// Portrait or square
				displayHeight = containerSize;
				displayWidth = containerSize * imageRatio;
			}

			// Create initial crop (free aspect - undefined)
			const newCrop = centerAspectCrop(displayWidth, displayHeight, undefined);
			setCrop(newCrop);
			setCompletedCrop(convertToPixelCrop(newCrop, displayWidth, displayHeight));
		},
		[containerSize],
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	// Load image as data URL for img tag
	useEffect(() => {
		if (!imageFile) {
			setTimeout(() => {
				setImageSrc(null);
				setCrop(undefined);
				setCompletedCrop(undefined);
			}, 0);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			setImageSrc(e.target?.result?.toString() || null);
		};
		reader.readAsDataURL(imageFile);
	}, [imageFile]);

	// Extract cropped region to canvas for processing
	useEffect(() => {
		if (!imgRef.current || !completedCrop) {
			return;
		}

		const image = imgRef.current;
		const crop = completedCrop;

		if (crop.width === 0 || crop.height === 0) return;

		// Create canvas from crop
		const canvas = document.createElement('canvas');
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		canvas.width = crop.width * scaleX;
		canvas.height = crop.height * scaleY;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width * scaleX,
			crop.height * scaleY,
		);

		// Update originalCanvasRef with cropped content
		const mainCtx = originalCanvasRef.current?.getContext('2d');
		if (mainCtx && originalCanvasRef.current) {
			originalCanvasRef.current.width = canvas.width;
			originalCanvasRef.current.height = canvas.height;
			mainCtx.drawImage(canvas, 0, 0);
			setCanvasReady(true);
		}
	}, [completedCrop]);

	// OLD CANVAS LOADING - DISABLED (now using crop-based workflow)
	// Load image to canvas when file is selected
	/*
	useEffect(() => {
		if (!imageFile || !originalCanvasRef.current) {
			setCanvasReady(false);
			setShowSchematicPreview(false);
			setPreviewImageBlob(null);
			setPixelGrid(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		console.log('Loading image to canvas, current blockSize:', settingsRef.current.blockSize);

		// Reset all states for new image
		setCanvasReady(false);
		setPixelGrid(null);
		setShowSchematicPreview(false);
		setPreviewImageBlob(null);
		setSchematicBlobs([]);

		loadImageToCanvas(imageFile)
			.then((canvas) => {
				const resized = resizeCanvas(canvas, 800, 800);
				const ctx = originalCanvasRef.current?.getContext('2d');
				if (ctx && originalCanvasRef.current) {
					originalCanvasRef.current.width = resized.width;
					originalCanvasRef.current.height = resized.height;
					ctx.drawImage(resized, 0, 0);

					// Set canvasReady to trigger auto-preview
					setCanvasReady(true);

					// Smart auto-adjustment: optimize blockSize and splits
					let optimalBlockSize = settingsRef.current.blockSize;
					let gridWidth = Math.ceil(resized.width / optimalBlockSize);
					let gridHeight = Math.ceil(resized.height / optimalBlockSize);

					console.log(
						`Image size: ${resized.width}×${resized.height}, Initial block size: ${optimalBlockSize}, Grid: ${gridWidth}×${gridHeight}`,
					);

					// Try to increase blockSize to fit in 128x128 without splits
					const maxBlockSize = 10; // Reasonable upper limit
					while ((gridWidth > 128 || gridHeight > 128) && optimalBlockSize < maxBlockSize) {
						optimalBlockSize++;
						gridWidth = Math.ceil(resized.width / optimalBlockSize);
						gridHeight = Math.ceil(resized.height / optimalBlockSize);
					}

					// Calculate splits if still needed
					const optimalSplitH = gridWidth > 128 ? Math.ceil(gridWidth / 128) : 1;
					const optimalSplitV = gridHeight > 128 ? Math.ceil(gridHeight / 128) : 1;

					console.log(
						`Optimal: blockSize=${optimalBlockSize}, grid=${gridWidth}×${gridHeight}, splits=${optimalSplitH}×${optimalSplitV}`,
					);

					// Update settings if changed
					const needsUpdate =
						optimalBlockSize !== settingsRef.current.blockSize ||
						optimalSplitH !== settingsRef.current.splitHorizontal ||
						optimalSplitV !== settingsRef.current.splitVertical;

					if (needsUpdate) {
						console.log(`✅ Auto-adjusting: blockSize=${optimalBlockSize}, splits=${optimalSplitH}×${optimalSplitV}`);
						setSettings((prev) => ({
							...prev,
							blockSize: optimalBlockSize,
							splitHorizontal: optimalSplitH,
							splitVertical: optimalSplitV,
						}));

						if (optimalSplitH > 1 || optimalSplitV > 1) {
							toast.info(
								<Tran
									text="generator-sorter.toast-auto-adjust"
									args={{ size: optimalBlockSize, h: optimalSplitH, v: optimalSplitV }}
								/>,
							);
						} else if (optimalBlockSize !== settingsRef.current.blockSize) {
							toast.info(
								<Tran
									text="generator-sorter.toast-auto-blocksize"
									args={{ size: optimalBlockSize }}
								/>,
							);
						}
					} else {
						console.log(`ℹ️ No adjustment needed (fits in 128×128)`);
					}

					// Reset schematic preview when changing image
					setShowSchematicPreview(false);
					setPreviewImageBlob(null);
				}
			})
			.catch((error) => {
				console.error('Failed to load image:', error);
				toast.error(<Tran text="tools.toast-load-error" />);
				setCanvasReady(false);
			});

	}, [imageFile]);
	*/

	// Auto-generate color preview using worker (with debounce)
	useEffect(() => {
		console.log('Auto-preview effect triggered (debounced)', {
			hasCanvas: !!originalCanvasRef.current,
			hasPreviewCanvas: !!previewCanvasRef.current,
			canvasReady,
			materialsCount: selectedMaterials.length,
			splits: `${settings.splitHorizontal}×${settings.splitVertical}`,
		});

		// Reset schematic preview when settings change
		setTimeout(() => {
			setShowSchematicPreview(false);
			setPreviewImageBlob(null);
		}, 0);

		if (!originalCanvasRef.current || !canvasReady || selectedMaterials.length === 0) {
			console.log('Auto-preview skipped - conditions not met');
			return;
		}

		// Get ImageData from canvas
		const ctx = originalCanvasRef.current.getContext('2d');
		if (!ctx) return;

		const imageData = ctx.getImageData(0, 0, originalCanvasRef.current.width, originalCanvasRef.current.height);

		// Process with worker (debounced internally)
		const materials = MINDUSTRY_MATERIALS.filter((m) => selectedMaterials.includes(m.name));
		processImageWithWorker(imageData, {
			blockSize: settings.blockSize,
			materials,
			dithering: settings.dithering,
			advancedDithering: settings.advancedDithering,
			advancedDitheringSettings: settings.advancedDitheringSettings,
		});
	}, [
		canvasReady,
		completedCrop, // Re-run when crop changes
		settings.blockSize,
		settings.dithering,
		settings.advancedDithering,
		settings.advancedDitheringSettings,
		settings.splitHorizontal,
		settings.splitVertical,
		selectedMaterials,
		processImageWithWorker,
	]);

	// Handle worker results
	useEffect(() => {
		if (!workerResult) return;

		let grid = workerResult.grid;
		setTimeout(() => {
			setPixelGrid(grid);
		}, 0);
		console.log('Worker result received:', grid.length, 'x', grid[0]?.length);

		// Apply splits to preview if enabled
		if (settings.splitHorizontal > 1 || settings.splitVertical > 1) {
			console.log(`Applying ${settings.splitHorizontal}×${settings.splitVertical} splits to preview...`);
			grid = applySplitsToGrid(grid, settings.splitHorizontal, settings.splitVertical);
			console.log('Preview grid with splits:', grid.length, 'x', grid[0]?.length);
		}

		// Draw color preview
		if (previewCanvasRef.current) {
			const gridWidth = grid[0]?.length || 0;
			const gridHeight = grid.length;
			const canvasWidth = gridWidth * settings.blockSize;
			const canvasHeight = gridHeight * settings.blockSize;

			previewCanvasRef.current.width = canvasWidth;
			previewCanvasRef.current.height = canvasHeight;

			drawPixelGrid(previewCanvasRef.current, grid, MINDUSTRY_MATERIALS);
			console.log('✅ Color preview drawn successfully!');
		}
	}, [workerResult, settings.blockSize, settings.splitHorizontal, settings.splitVertical]);

	// Handle worker errors
	useEffect(() => {
		if (workerError) {
			console.error('Worker error:', workerError);
			toast.error('Failed to process image: ' + workerError);
		}
	}, [workerError]);

	const handleGenerate = useCallback(async () => {
		if (!imageFile || selectedMaterials.length === 0 || !originalCanvasRef.current || !pixelGrid) {
			toast.error(
				<Tran
					text="generator-sorter.toast-upload-select"
				/>,
			);
			return;
		}

		setIsGenerating(true);
		setPreviewImageBlob(null);
		setSchematicFiles([]);

		try {
			// Use existing pixel grid from auto-preview
			const grid = pixelGrid;

			const width = grid[0]?.length || 0;
			const height = grid.length;
			const baseFilename = (imageFile?.name || 'image').replace(/\.[^/.]+$/, '');
			const tags = {
				name: baseFilename,
				description: t('generator-sorter.schematic-description'),
			};
			const writer = new SchematicWriter();

			const generatedFiles: SchematicFile[] = [];

			// Check if splitting is required
			if (settings.splitHorizontal > 1 || settings.splitVertical > 1) {
				const partsX = settings.splitHorizontal;
				const partsY = settings.splitVertical;
				const partWidth = Math.ceil(width / partsX);
				const partHeight = Math.ceil(height / partsY);

				// Validate: Each piece should be <= 128x128 (warning only)
				if (partWidth > 128 || partHeight > 128) {
					toast.warning(
						<Tran
							text="generator-sorter.toast-size-warning"
							args={{ width: partWidth, height: partHeight }}
						/>,
					);
				}

				// Generate alphabet for column naming (a, b, c, ...)
				const getColumnLetter = (index: number) => String.fromCharCode(97 + index); // 'a' = 97

				for (let py = 0; py < partsY; py++) {
					for (let px = 0; px < partsX; px++) {
						const startX = px * partWidth;
						const startY = py * partHeight;
						const endX = Math.min(startX + partWidth, width);
						const endY = Math.min(startY + partHeight, height);

						const subWidth = endX - startX;
						const subHeight = endY - startY;

						if (subWidth <= 0 || subHeight <= 0) continue;

						// Create subgrid with adjusted coordinates
						const subGrid: PixelGrid = [];
						for (let y = 0; y < subHeight; y++) {
							const row: PixelGridCell[] = [];
							for (let x = 0; x < subWidth; x++) {
								const originalCell = grid[startY + y]?.[startX + x];
								if (originalCell) {
									row.push({
										...originalCell,
										x: x,
										y: y,
									});
								} else {
									row.push(null as unknown as PixelGridCell);
								}
							}
							subGrid.push(row);
						}

						const rowNumber = py + 1;
						const colLetter = getColumnLetter(px);
						const schematicName = `${baseFilename}-${rowNumber}${colLetter}`;

						const partBlob = await writer.generate(
							subGrid,
							subWidth,
							subHeight,
							{
								name: schematicName,
								description: t('generator-sorter.schematic-description'),
							},
							settings.blockType,
						);
						generatedFiles.push({
							blob: partBlob,
							filename: `${schematicName}.msch`,
						});
					}
				}
			} else {
				// No split - validate single file size (warning only)
				if (width > 128 || height > 128) {
					toast.warning(
						<Tran
							text="generator-sorter.toast-size-warning-single"
							args={{ width, height }}
						/>,
					);
				}

				// Use tags defined earlier (already has baseFilename as name)
				const blob = await writer.generate(grid, width, height, tags, settings.blockType);
				generatedFiles.push({
					blob: blob,
					filename: `${baseFilename}.msch`,
				});
			}

			setSchematicFiles(generatedFiles);

			// Generate schematic preview using backend API
			try {
				let previewSchematicBlob: Blob;
				if (settings.splitHorizontal > 1 || settings.splitVertical > 1) {
					// Create grid with visual gaps for preview
					const previewGrid = applySplitsToGrid(grid, settings.splitHorizontal, settings.splitVertical);
					const previewWidth = previewGrid[0]?.length || 0;
					const previewHeight = previewGrid.length;
					previewSchematicBlob = await writer.generate(
						previewGrid,
						previewWidth,
						previewHeight,
						{ ...tags, name: 'Preview' },
						settings.blockType,
					);
				} else {
					// No split, use the single generated file
					previewSchematicBlob = generatedFiles[0]?.blob || new Blob();
				}

				// Convert blob to base64 for API
				const arrayBuffer = await previewSchematicBlob.arrayBuffer();
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

				console.log('Calling backend API to render schematic image...');

				// Use FormData as per API spec
				const formData = new FormData();
				formData.append('data', base64);

				const imgResponse = await fetch(`${environment.url.apiV4}/schematics/image`, {
					method: 'POST',
					body: formData, // FormData, not JSON
					signal: AbortSignal.timeout(15000),
				});

				if (imgResponse.ok) {
					const contentType = imgResponse.headers.get('content-type');
					console.log('Response content-type:', contentType);

					// Check if API returned JSON (likely error or response format)
					if (contentType?.includes('application/json')) {
						const jsonResponse = await imgResponse.json();
						console.error('❌ API returned JSON instead of image:', jsonResponse);
						toast.error(<Tran text="generator-sorter.toast-api-json-error" />);
						setShowSchematicPreview(false);
					} else {
						// It's an image
						const imgBlob = await imgResponse.blob();
						console.log('✅ Received image blob:', { size: imgBlob.size, type: imgBlob.type });

						setPreviewImageBlob(imgBlob);
						setShowSchematicPreview(true);
						console.log('✅ Schematic preview rendered successfully!');
					}
				} else {
					const status = imgResponse.status;
					const errorText = await imgResponse.text();
					console.warn('Backend preview failed:', { status, error: errorText });
					setShowSchematicPreview(false);
				}
			} catch (error) {
				console.warn('Failed to render schematic preview:', error);
				setShowSchematicPreview(false);
			}

			toast.success(
				<Tran
					text="generator-sorter.toast-generated"
					args={{ count: generatedFiles.length }}
				/>,
			);
		} catch (error) {
			console.error('Failed to generate schematic:', error);
			toast.error(
				<Tran
					text="generator-sorter.toast-generate-failed"
					args={{ error: error instanceof Error ? error.message : 'Unknown error' }}
				/>,
			);
		} finally {
			setIsGenerating(false);
		}
	}, [imageFile, selectedMaterials, settings, pixelGrid, setSchematicFiles]);

	return (
		<PageWrapper className="gap-1 p-1">
			<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl md:text-3xl font-bold">
					<Tran text="generator-sorter.title" />
				</h1>
				<p className="text-sm md:text-base text-muted-foreground">
					<Tran
						text="generator-sorter.description"
					/>
				</p>
			</div>

			{/* Main Content */}
			<div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
				{/* Column 1: Image Upload / Preview */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
					<div className="h-full flex flex-col min-h-0">
						<div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
							<h3 className="text-base font-semibold">
								<Tran text="generator-sorter.image-preview" />
							</h3>
							<div className="aspect-square w-full flex items-center justify-center overflow-hidden rounded border bg-muted/30 min-h-0 relative p-1.5">
								<div ref={containerRef} className="h-full w-full border-0 bg-transparent min-h-0">
									{!imageSrc ? (
										<ImageUpload
											onImageSelected={setImageFile}
											className="h-full w-full border-0 bg-transparent min-h-0"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center overflow-hidden p-1.5">
											<ReactCrop
												crop={crop}
												onChange={(_, percentCrop) => setCrop(percentCrop)}
												onComplete={(c) => setCompletedCrop(c)}
												style={{
													maxWidth: '100%',
													maxHeight: '100%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													ref={imgRef}
													src={imageSrc}
													alt="Upload"
													onLoad={onImageLoad}
													style={{
														display: 'block',
														maxWidth: `${containerSize}px`,
														maxHeight: `${containerSize}px`,
														width: 'auto',
														height: 'auto',
														objectFit: 'contain',
													}}
												/>
											</ReactCrop>
										</div>
									)}
								</div>
								{/* Hidden canvas for processing */}
								<canvas ref={originalCanvasRef} style={{ display: 'none' }} />
							</div>
							<Button
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								className="w-full mt-auto truncate"
							>
								<Tran text="generator-sorter.upload-image" />
							</Button>
						</div>
					</div>
				</div>

				{/* Column 2: Schematic Output */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
					<div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
						<h3 className="text-base font-semibold">
							<Tran text="generator-sorter.schematic-output" />
						</h3>

						{/* Square container for preview - always rendered */}
						<div className="aspect-square w-full flex items-center justify-center bg-black/5 rounded overflow-hidden relative border min-h-0">
							{showSchematicPreview && previewImageBlob && (
								// Schematic Preview (after Generate)
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={URL.createObjectURL(previewImageBlob)}
									alt="Schematic Preview"
									className="w-full h-full object-contain shadow-sm absolute inset-0 z-10"
								/>
							)}
							{/* Color Preview - always rendered for ref */}
							<canvas
								ref={previewCanvasRef}
								className={`w-full h-full object-contain ${showSchematicPreview && previewImageBlob ? 'hidden' : ''}`}
							/>
							{/* Placeholder when no image */}
							{!pixelGrid && !showSchematicPreview && !isWorkerProcessing && (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
									<Sparkles className="h-8 w-8 mb-2 opacity-20" />
									<p className="text-sm">
										<Tran text="generator-sorter.no-schematic" />
									</p>
								</div>
							)}
							<ProcessingOverlay
								isVisible={isWorkerProcessing}
								progress={workerProgress}
								currentStep={workerStep}
								stepMessage={workerMessage}
								onCancel={cancelWorker}
							/>

							{/* Preview Mode Indicator */}
							<div className="absolute top-2 right-2 z-10">
								<span
									className={`text-xs px-2 py-1 rounded-md font-medium ${
										showSchematicPreview && previewImageBlob
											? 'bg-green-500/20 text-green-700 dark:text-green-300'
											: 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
									}`}
								>
									{showSchematicPreview && previewImageBlob ? (
										<Tran text="generator-sorter.schematic-preview" />
									) : (
										<Tran text="generator-sorter.canvas-preview" />
									)}
								</span>
							</div>
						</div>

						{pixelGrid && (
							<SchematicActions
								files={schematicFiles}
								onDownload={handleDownload}
								onCopyClick={handleCopyClick}
								className="mt-auto"
							/>
						)}
					</div>
				</div>

				{/* Column 3: Settings & Materials */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0 col-span-2 lg:col-span-1">
					<div className="rounded-lg border p-4 lg:h-full lg:overflow-y-auto flex flex-col gap-4 min-h-0">
						<SettingsPanel
							settings={settings}
							onSettingsChange={setSettings}
							imageWidth={originalCanvasRef.current?.width ?? 0}
							imageHeight={originalCanvasRef.current?.height ?? 0}
							showOutputInfo={false}
							imageFile={imageFile}
							className="border-0 p-0 shadow-none"
						/>

						<AdvancedSettings
							settings={settings}
							onSettingsChange={setSettings}
							materials={MINDUSTRY_MATERIALS}
							selectedMaterials={selectedMaterials}
							onMaterialsChange={setSelectedMaterials}
						/>

						{pixelGrid && imageFile && (
							<OutputInfoPanel
								info={{
									width: pixelGrid[0]?.length || 0,
									height: pixelGrid.length,
									fileCount: schematicFiles.length || settings.splitHorizontal * settings.splitVertical,
									sourceFile: {
										name: imageFile.name,
										originalWidth: imgRef.current?.naturalWidth || 0,
										originalHeight: imgRef.current?.naturalHeight || 0,
										sizeBytes: imageFile.size,
									},
									sorterCanvas: {
										blockType: settings.blockType,
										materialsUsed: selectedMaterials.length,
										materialsTotal: MINDUSTRY_MATERIALS.length,
										splitH: settings.splitHorizontal,
										splitV: settings.splitVertical,
									},
								}}
								thresholds={{
									maxDimension: 256,
									warnDimension: 200,
								}}
								unit="tiles"
								generatorName="Sorter Generator"
							/>
						)}

						<Button
							onClick={handleGenerate}
							disabled={isGenerating || !imageFile || selectedMaterials.length === 0 || isWorkerProcessing}
							className="w-full mt-auto"
							size="lg"
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									<Tran text="generator-sorter.generating" />
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-5 w-5" />
									<Tran text="generator-sorter.generate" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Copy Dialog - using shared component */}
			<CopyDialog
				open={showCopyDialog}
				onOpenChange={setShowCopyDialog}
				files={schematicFiles}
				onCopy={handleCopy}
				translationPrefix="generator-sorter"
			/>
		</PageWrapper>
	);
}

// Helper function to apply visual splits (gaps) to the grid for preview schematic
function applySplitsToGrid(grid: PixelGrid, splitX: number, splitY: number): PixelGrid {
	if (splitX <= 1 && splitY <= 1) return grid;

	const height = grid.length;
	const width = grid[0]?.length || 0;
	const gapSize = 2; // 2 block gap for clear visual separation

	const partsX = splitX;
	const partsY = splitY;

	const gapsX = Math.max(0, partsX - 1);
	const gapsY = Math.max(0, partsY - 1);

	const partWidth = Math.ceil(width / partsX);
	const partHeight = Math.ceil(height / partsY);

	const newWidth = width + gapsX * gapSize;
	const newHeight = height + gapsY * gapSize;

	// Initialize new grid with nulls
	const newGrid: PixelGrid = Array(newHeight)
		.fill(null)
		.map(() => Array(newWidth).fill(null));

	for (let py = 0; py < partsY; py++) {
		for (let px = 0; px < partsX; px++) {
			const srcStartX = px * partWidth;
			const srcStartY = py * partHeight;
			const srcEndX = Math.min(srcStartX + partWidth, width);
			const srcEndY = Math.min(srcStartY + partHeight, height);

			const dstStartX = srcStartX + px * gapSize;
			const dstStartY = srcStartY + py * gapSize;

			for (let y = 0; y < srcEndY - srcStartY; y++) {
				for (let x = 0; x < srcEndX - srcStartX; x++) {
					const cell = grid[srcStartY + y]?.[srcStartX + x];
					if (cell && newGrid[dstStartY + y]) {
						newGrid[dstStartY + y]![dstStartX + x] = {
							...cell,
							x: dstStartX + x,
							y: dstStartY + y,
						};
					}
				}
			}
		}
	}

	return newGrid;
}
