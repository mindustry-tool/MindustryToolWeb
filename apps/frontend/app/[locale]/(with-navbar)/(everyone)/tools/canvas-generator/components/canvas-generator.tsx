/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
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

// Shared hooks
import { useSchematicFiles, type SchematicFile } from '@/lib/tools';

// Libs
import { drawPixelGrid, useImageWorker } from '@/lib/image-processing';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';
import { MINDUSTRY_MATERIALS } from '../lib/materials';
import { SchematicWriter } from '../lib/schematic-writer';
import type { GeneratorSettings, PixelGrid } from '../lib/types';

function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: '%',
				width: 100,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	)
}

const DEFAULT_SETTINGS: GeneratorSettings = {
	blockType: 'canvas',
	dithering: false,
	advancedDithering: false,
	advancedDitheringSettings: DEFAULT_DITHERING_SETTINGS,
	screenX: 1,
	screenY: 1,
};

export default function CanvasGenerator() {
	const { t } = useI18n('generator-canvas');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [selectedMaterials, setSelectedMaterials] = useState<string[]>(MINDUSTRY_MATERIALS.map((m) => m.name));
	const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS);
	const [debouncedSettings, setDebouncedSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS);

	// Keep a ref to settings to access latest value in useEffect without triggering re-runs
	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	// Debounce settings to avoid too many re-renders during adjustment
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSettings(settings);
		}, 500);
		return () => clearTimeout(timer);
	}, [settings]);

	const [pixelGrid, setPixelGrid] = useState<PixelGrid | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [canvasReady, setCanvasReady] = useState(false);
	const [canvasVersion, setCanvasVersion] = useState(0);

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

	// Crop-related state
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState<number>(0);
	const imgRef = useRef<HTMLImageElement>(null);
	const lastAutoSizedImageRef = useRef<string | null>(null);
	const isAutoSizingRef = useRef(false);

	// Calculate crop aspect ratio based on screenX/screenY
	const cropAspectRatio = (settings.screenX * 12) / (settings.screenY * 12);

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
	const resizeWorkerRef = useRef<Worker | null>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	// Load image file to data URL for crop display
	useEffect(() => {
		if (!imageFile) {
			setImageSrc(null);
			setCrop(undefined);
			setCompletedCrop(undefined);
			lastAutoSizedImageRef.current = null;
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', () => {
			setImageSrc(reader.result?.toString() || null);
		});
		reader.readAsDataURL(imageFile);
	}, [imageFile]);

	// Observe container size for crop calculations
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

	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const { naturalWidth, naturalHeight } = e.currentTarget;

		// AUTO-CALCULATE optimal screenX/screenY based on natural dimensions
		if (imageFile && lastAutoSizedImageRef.current !== imageFile.name) {
			// Mark that we're auto-sizing to prevent double processing
			isAutoSizingRef.current = true;

			const imageRatio = naturalWidth / naturalHeight;
			const maxTiling = 64;
			let bestX = 1, bestY = 1;
			let bestDiff = Number.MAX_VALUE;
			let bestArea = 0;

			for (let x = 1; x <= maxTiling; x++) {
				for (let y = 1; y <= maxTiling; y++) {
					const gridRatio = x / y;
					const diff = Math.abs(Math.log(gridRatio / imageRatio));
					const area = x * y;

					if (diff < bestDiff - 0.01) {
						bestDiff = diff;
						bestX = x;
						bestY = y;
						bestArea = area;
					} else if (Math.abs(diff - bestDiff) <= 0.01) {
						if (area > bestArea) {
							bestDiff = diff;
							bestX = x;
							bestY = y;
							bestArea = area;
						}
					}
				}
			}

			setSettings(prev => ({
				...prev,
				screenX: bestX,
				screenY: bestY
			}));

			lastAutoSizedImageRef.current = imageFile.name;
		}
	};

	// Update crop when screenX/screenY changes (skip if auto-sizing just ran)
	useEffect(() => {
		// Skip if onImageLoad just set the settings during auto-sizing
		if (isAutoSizingRef.current) {
			isAutoSizingRef.current = false;
			return;
		}

		if (imgRef.current && imageSrc) {
			const { width, height } = imgRef.current;
			if (width === 0 || height === 0) return;

			const newCrop = centerAspectCrop(width, height, cropAspectRatio);
			setCrop(newCrop);
			setCompletedCrop(convertToPixelCrop(newCrop, width, height));
		}
	}, [settings.screenX, settings.screenY, cropAspectRatio, imageSrc]);

	// Process cropped image using hybrid approach: Worker crops, pica resizes (Lanczos3 quality)
	useEffect(() => {
		if (!imgRef.current || !completedCrop || !originalCanvasRef.current) return;

		const image = imgRef.current;
		const crop = completedCrop;

		if (crop.width === 0 || crop.height === 0) return;

		// Calculate crop coordinates at original resolution
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		const cropX = Math.round(crop.x * scaleX);
		const cropY = Math.round(crop.y * scaleY);
		const cropWidth = Math.round(crop.width * scaleX);
		const cropHeight = Math.round(crop.height * scaleY);

		const targetWidth = settings.screenX * 12;
		const targetHeight = settings.screenY * 12;

		// Create ImageBitmap from the image (async, lightweight on main thread)
		createImageBitmap(image).then(bitmap => {
			// Create crop worker if not exists (using shared worker)
			if (!resizeWorkerRef.current) {
				resizeWorkerRef.current = new Worker(
					new URL('@/lib/image-processing/crop-worker.ts', import.meta.url)
				);
			}

			// Handle worker response - worker only crops, pica resizes
			resizeWorkerRef.current.onmessage = async (e) => {
				const { type, imageData, error } = e.data;
				if (type === 'success' && originalCanvasRef.current) {
					// Use requestIdleCallback to minimize UI blocking during pica resize
					const runPicaResize = async () => {
						try {
							// Create pica instance without workers (we manage threading ourselves)
							const { default: Pica } = await import('pica');
							const pica = new Pica({ features: ['js', 'wasm'] });

							// Create source canvas from cropped ImageData
							const srcCanvas = document.createElement('canvas');
							srcCanvas.width = imageData.width;
							srcCanvas.height = imageData.height;
							const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
							if (!srcCtx) throw new Error('Failed to get source context');
							srcCtx.putImageData(imageData, 0, 0);

							// Create destination canvas
							const destCanvas = document.createElement('canvas');
							destCanvas.width = targetWidth;
							destCanvas.height = targetHeight;

							// Run pica Lanczos3 resize
							await pica.resize(srcCanvas, destCanvas, {
								quality: 3, // Lanczos3
								unsharpAmount: 80,
								unsharpRadius: 0.6,
								unsharpThreshold: 2,
							});

							// Put resized data to original canvas
							if (originalCanvasRef.current) {
								const originalCtx = originalCanvasRef.current.getContext('2d', { willReadFrequently: true });
								if (originalCtx) {
									originalCanvasRef.current.width = targetWidth;
									originalCanvasRef.current.height = targetHeight;
									originalCtx.drawImage(destCanvas, 0, 0);
									setCanvasReady(true);
									setCanvasVersion(v => v + 1);
								}
							}
						} catch (err) {
							console.error('Pica resize failed:', err);
							// Fallback: put cropped data directly
							if (originalCanvasRef.current) {
								const originalCtx = originalCanvasRef.current.getContext('2d', { willReadFrequently: true });
								if (originalCtx) {
									originalCanvasRef.current.width = imageData.width;
									originalCanvasRef.current.height = imageData.height;
									originalCtx.putImageData(imageData, 0, 0);
									setCanvasReady(true);
									setCanvasVersion(v => v + 1);
								}
							}
						}
					};

					// Use requestIdleCallback if available, otherwise setTimeout
					if ('requestIdleCallback' in window) {
						requestIdleCallback(() => runPicaResize());
					} else {
						setTimeout(() => runPicaResize(), 0);
					}
				} else if (error) {
					console.error('Crop worker failed:', error);
				}
			};

			// Send to worker - bitmap is transferred (zero-copy)
			resizeWorkerRef.current.postMessage({
				type: 'crop',
				bitmap,
				cropX,
				cropY,
				cropWidth,
				cropHeight,
			}, [bitmap]);
		}).catch(err => {
			console.error('Failed to create ImageBitmap:', err);
		});

		// Cleanup worker on unmount
		return () => {
			resizeWorkerRef.current?.terminate();
			resizeWorkerRef.current = null;
		};
	}, [completedCrop, settings.screenX, settings.screenY]);

	// Auto-generate color preview using worker
	useEffect(() => {
		if (!originalCanvasRef.current || !canvasReady || selectedMaterials.length === 0) {
			return;
		}

		const ctx = originalCanvasRef.current.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		const imageData = ctx.getImageData(
			0,
			0,
			originalCanvasRef.current.width,
			originalCanvasRef.current.height,
		);

		const materials = MINDUSTRY_MATERIALS.filter((m) => selectedMaterials.includes(m.name));
		processImageWithWorker(imageData, {
			materials,
			dithering: debouncedSettings.dithering,
			advancedDithering: debouncedSettings.advancedDithering,
			advancedDitheringSettings: debouncedSettings.advancedDitheringSettings,
		});
	}, [
		canvasReady,
		canvasVersion,
		debouncedSettings.dithering,
		debouncedSettings.advancedDithering,
		debouncedSettings.advancedDitheringSettings,
		selectedMaterials,
		processImageWithWorker,
	]);

	// Handle worker results
	useEffect(() => {
		if (!workerResult) return;

		const { grid } = workerResult;
		setPixelGrid(grid);

		if (previewCanvasRef.current) {
			const gridWidth = grid[0]?.length || 0;
			const gridHeight = grid.length;

			previewCanvasRef.current.width = gridWidth;
			previewCanvasRef.current.height = gridHeight;

			drawPixelGrid(previewCanvasRef.current, grid, MINDUSTRY_MATERIALS, '#362944');
		}
	}, [workerResult]);

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
					text="generator-canvas.toast-upload-select"
				/>,
			);
			return;
		}

		setIsGenerating(true);
		setSchematicFiles([]);

		try {
			const grid = pixelGrid;
			const width = grid[0]?.length || 0;
			const height = grid.length;

			const baseFilename = (imageFile?.name || 'image').replace(/\.[^/.]+$/, '');
			const tags = {
				name: baseFilename,
				description: t('generator-canvas.schematic-description'),
			};
			const writer = new SchematicWriter();

			const generatedFiles: SchematicFile[] = [];

			const canvasBlocksX = Math.ceil(width / 12);
			const canvasBlocksY = Math.ceil(height / 12);
			const tilesX = canvasBlocksX * 2;
			const tilesY = canvasBlocksY * 2;

			if (tilesX > 128 || tilesY > 128) {
				toast.warning(
					<Tran
						text="generator-canvas.toast-size-limit-single-v3"
						args={{ width: tilesX, height: tilesY }}
					/>,
				);
			}

			const blob = await writer.generate(grid, width, height, tags, settings.blockType);
			generatedFiles.push({
				blob: blob,
				filename: `${baseFilename}.msch`,
			});

			setSchematicFiles(generatedFiles);
			toast.success(
				<Tran
					text="generator-canvas.toast-generated"
					args={{ count: generatedFiles.length }}
				/>,
			);
		} catch (error) {
			console.error('Failed to generate schematic:', error);
			toast.error(<Tran text="tools.toast-generate-failed" />);
		} finally {
			setIsGenerating(false);
		}
	}, [imageFile, selectedMaterials, settings, pixelGrid, setSchematicFiles]);

	return (
		<PageWrapper className="gap-1 p-1">
			<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
			<canvas ref={originalCanvasRef} style={{ display: 'none' }} />

			<div className="space-y-2">
				<h1 className="text-2xl md:text-3xl font-bold">
					<Tran text="generator-canvas.title" />
				</h1>
				<p className="text-sm md:text-base text-muted-foreground">
					<Tran
						text="generator-canvas.description"
					/>
				</p>
			</div>

			<div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
				{/* Column 1: Image Preview */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
					<div className="h-full flex flex-col min-h-0">
						<div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
							<h3 className="text-base font-semibold">
								<Tran text="tools.image-preview" />
							</h3>
							<div ref={containerRef} className="aspect-square w-full flex items-center justify-center overflow-hidden rounded border bg-muted/30 relative p-1.5">
								{!imageFile || !imageSrc ? (
									<ImageUpload
										onImageSelected={setImageFile}
										className="h-full w-full border-0 bg-transparent"
										translationPrefix="tools"
									/>
								) : (
									<div
										className="absolute inset-0 flex items-center justify-center overflow-hidden"
										style={containerSize > 0 ? {
											width: `${containerSize}px`,
											height: `${containerSize}px`
										} : undefined}
									>
										<ReactCrop
											key={`crop-${settings.screenX}-${settings.screenY}`}
											crop={crop}
											onChange={(_, percentCrop) => setCrop(percentCrop)}
											onComplete={(c) => setCompletedCrop(c)}
											aspect={cropAspectRatio}
											style={{
												maxWidth: '100%',
												maxHeight: '100%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center'
											}}
										>
											<img
												ref={imgRef}
												src={imageSrc}
												alt="Upload"
												onLoad={onImageLoad}
												style={{
													display: 'block',
													maxWidth: `${containerSize}px`,
													maxHeight: `${containerSize}px`,
													minWidth: '100%',
													minHeight: '100%',
													width: 'auto',
													height: 'auto',
													objectFit: 'contain',
												}}
											/>
										</ReactCrop>
									</div>
								)}
							</div>
							<Button
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								className="w-full mt-auto truncate"
							>
								<Tran text="tools.upload-image" />
							</Button>
						</div>
					</div>
				</div>

				{/* Column 2: Schematic Output */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
					<div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
						<h3 className="text-base font-semibold">
							<Tran text="tools.schematic-output" />
						</h3>

						<div className="aspect-square w-full flex items-center justify-center bg-black/5 rounded overflow-hidden relative border min-h-0">
							<canvas ref={previewCanvasRef} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
							{!pixelGrid && !isWorkerProcessing && (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
									<Sparkles className="h-8 w-8 mb-2 opacity-20" />
									<p className="text-sm">
										<Tran text="tools.no-schematic" />
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
								<span className="text-xs px-2 py-1 rounded-md font-medium bg-blue-500/20 text-blue-700 dark:text-blue-300">
									<Tran text="tools.canvas-preview" />
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

				{/* Column 3: Settings */}
				<div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0 col-span-2 lg:col-span-1">
					<div className="rounded-lg border p-4 lg:h-full lg:overflow-y-auto flex flex-col gap-4 min-h-0">
						<SettingsPanel
							settings={settings}
							onSettingsChange={setSettings}
							imageWidth={imageFile ? originalCanvasRef.current?.width : undefined}
							imageHeight={imageFile ? originalCanvasRef.current?.height : undefined}
							showOutputInfo={!!pixelGrid}
							imageFile={imageFile}
							className="border-0 p-0 shadow-none"
							onReset={() => lastAutoSizedImageRef.current = null}
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
									width: settings.screenX * 2,
									height: settings.screenY * 2,
									fileCount: schematicFiles.length || 1,
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
									},
								}}
								thresholds={{
									maxDimension: 128,
									warnDimension: 100,
								}}
								unit="tiles"
								generatorName="Canvas Generator"
							/>
						)}

						<Button
							onClick={handleGenerate}
							disabled={isGenerating || !imageFile || selectedMaterials.length === 0}
							className="w-full mt-auto"
							size="lg"
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									<Tran text="tools.generating" />
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-5 w-5" />
									<Tran text="tools.generate" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Copy Dialog - now using shared component */}
			<CopyDialog
				open={showCopyDialog}
				onOpenChange={setShowCopyDialog}
				files={schematicFiles}
				onCopy={handleCopy}
				translationPrefix="tools"
			/>
		</PageWrapper>
	);
}
