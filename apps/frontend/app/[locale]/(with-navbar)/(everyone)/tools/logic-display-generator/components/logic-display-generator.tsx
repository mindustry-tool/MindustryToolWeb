/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { PageWrapper } from '@/components/common/page-wrapper';
import { Tran } from '@/i18n/tran';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/i18n.client';
import { toast } from 'sonner';
import { DEFAULT_SETTINGS, DISPLAY_SPECS, DISPLAY_TYPES } from '../lib/constants';
import { GridProcessor } from '../lib/grid-processor';

import { SchematicWriter } from '../lib/schematic-writer';
import type { GeneratorSettings } from '../lib/types';
import { SettingsPanel } from './settings-panel';
import { DisplayCropPreview } from './display-crop-preview';
import { DisplayCanvasPreview } from './display-canvas-preview';

// Shared components
import { CopyDialog } from '@/components/tools/CopyDialog';
import { OutputInfoPanel } from '@/components/tools/OutputInfoPanel';

// Shared hooks & types
import { useSchematicFiles } from '@/lib/tools';

import { type Crop, type PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';

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

export default function LogicDisplayGenerator() {
    const { t } = useI18n('generator-logic-display');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS);
    const [debouncedSettings, setDebouncedSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS);

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<number>(0);

    const cropAspectRatio = (debouncedSettings.screenX * DISPLAY_SPECS[debouncedSettings.displaySize].width) / (debouncedSettings.screenY * DISPLAY_SPECS[debouncedSettings.displaySize].height);

    const [previewBitmap, setPreviewBitmap] = useState<ImageBitmap | null>(null);
    const [cachedImageData, setCachedImageData] = useState<ImageData | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string[][]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [showGrid, setShowGrid] = useState(true);
    const [previewMode, setPreviewMode] = useState<'canvas' | 'schematic'>('canvas');

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

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastAutoSizedImageRef = useRef<string | null>(null);

    const [stats, setStats] = useState({ pixelCount: 0, instructionCount: 0, processorCount: 0 });
    const workerRef = useRef<Worker | null>(null);
    const cropWorkerRef = useRef<Worker | null>(null);
    const isCancelledRef = useRef(false);
    const isAutoSizingRef = useRef(false);

    const handleReset = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        setDebouncedSettings(DEFAULT_SETTINGS);
        setPreviewMode('canvas'); // Reset to canvas preview
        lastAutoSizedImageRef.current = null; // Allow auto-calc to run again

        // Trigger re-calc if we have an image
        if (imgRef.current && imageFile) {
            const img = imgRef.current;
            const { naturalWidth, naturalHeight } = img;

            const spec = DISPLAY_SPECS[DEFAULT_SETTINGS.displaySize];
            const displayType = DISPLAY_TYPES.find(t => t.value === DEFAULT_SETTINGS.displaySize);
            const maxTiling = displayType?.maxTiling || 4;
            const imageRatio = naturalWidth / naturalHeight;

            let bestX = 1;
            let bestY = 1;
            let bestDiff = Number.MAX_VALUE;
            let bestArea = 0;

            for (let x = 1; x <= maxTiling; x++) {
                for (let y = 1; y <= maxTiling; y++) {
                    const gridW = x * spec.width;
                    const gridH = y * spec.height;
                    const gridRatio = gridW / gridH;

                    const diff = Math.abs(Math.log(gridRatio / imageRatio));
                    const area = x * y;

                    if (diff < bestDiff - 0.05) {
                        bestDiff = diff;
                        bestX = x;
                        bestY = y;
                        bestArea = area;
                    } else if (Math.abs(diff - bestDiff) <= 0.05) {
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
    }, [imageFile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSettings(settings);
        }, 500);
        return () => clearTimeout(timer);
    }, [settings]);

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

    useEffect(() => {
        if (!imageFile) {
            setImageSrc(null);
            setCachedImageData(null);
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

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;

        // Only auto-calculate if this image hasn't been auto-sized yet
        // OR if we don't have a record of it (new upload)
        if (imageFile && lastAutoSizedImageRef.current !== imageFile.name) {
            // Mark that we're auto-sizing to prevent double processing
            isAutoSizingRef.current = true;

            // 1. Auto-calculate optimal grid size based on NATURAL dimensions
            const spec = DISPLAY_SPECS[settings.displaySize];
            const displayType = DISPLAY_TYPES.find(t => t.value === settings.displaySize);
            const maxTiling = displayType?.maxTiling || 4;
            const imageRatio = naturalWidth / naturalHeight;

            let bestX = 1;
            let bestY = 1;
            let bestDiff = Number.MAX_VALUE;
            let bestArea = 0;

            for (let x = 1; x <= maxTiling; x++) {
                for (let y = 1; y <= maxTiling; y++) {
                    const gridW = x * spec.width;
                    const gridH = y * spec.height;
                    const gridRatio = gridW / gridH;

                    const diff = Math.abs(Math.log(gridRatio / imageRatio));
                    const area = x * y;

                    if (diff < bestDiff - 0.05) {
                        bestDiff = diff;
                        bestX = x;
                        bestY = y;
                        bestArea = area;
                    } else if (Math.abs(diff - bestDiff) <= 0.05) {
                        if (area > bestArea) {
                            bestDiff = diff;
                            bestX = x;
                            bestY = y;
                            bestArea = area;
                        }
                    }
                }
            }

            // Update settings with calculated grid size
            setSettings(prev => ({
                ...prev,
                screenX: bestX,
                screenY: bestY
            }));

            lastAutoSizedImageRef.current = imageFile.name;

            // 2. Calculate crop based on the NEW grid aspect ratio
            const newCropAspectRatio = (bestX * spec.width) / (bestY * spec.height);

            // Use containerSize (measured via ResizeObserver)
            if (containerSize === 0) return;

            // Calculate display dimensions
            let displayWidth: number;
            let displayHeight: number;

            if (imageRatio > 1) {
                // Landscape: constrain width
                displayWidth = containerSize;
                displayHeight = containerSize / imageRatio;
            } else {
                // Portrait: constrain height
                displayHeight = containerSize;
                displayWidth = containerSize * imageRatio;
            }

            const newCrop = centerAspectCrop(displayWidth, displayHeight, newCropAspectRatio);
            setCrop(newCrop);
            setCompletedCrop(convertToPixelCrop(newCrop, displayWidth, displayHeight));
        } else {
            // If already auto-sized, just ensure crop is valid for current settings?
            // Or do nothing?
            // We should probably ensure crop is set if it's missing (e.g. initial load but logic skipped)
            // But usually onImageLoad runs once.
            // If we skip auto-calc, we should still ensure crop is initialized if undefined.
            if (!crop && containerSize > 0) {
                const imageRatio = naturalWidth / naturalHeight;
                let displayWidth: number;
                let displayHeight: number;

                if (imageRatio > 1) {
                    displayWidth = containerSize;
                    displayHeight = containerSize / imageRatio;
                } else {
                    displayHeight = containerSize;
                    displayWidth = containerSize * imageRatio;
                }

                const newCrop = centerAspectCrop(displayWidth, displayHeight, cropAspectRatio);
                setCrop(newCrop);
                setCompletedCrop(convertToPixelCrop(newCrop, displayWidth, displayHeight));
            }
        }
    };

    // Update crop when settings change (skip if auto-sizing just ran)
    useEffect(() => {
        // Skip if onImageLoad just set the crop during auto-sizing
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
    }, [debouncedSettings.displaySize, debouncedSettings.screenX, debouncedSettings.screenY, cropAspectRatio, imageSrc]);

    // Process crop with hybrid approach: Worker crops, pica resizes (Lanczos3 quality)
    useEffect(() => {
        if (!imgRef.current || !completedCrop) return;

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

        // Calculate target size based on display settings
        const spec = DISPLAY_SPECS[debouncedSettings.displaySize];
        let targetWidth: number;
        let targetHeight: number;

        if (debouncedSettings.displaySize === '26x26') {
            targetWidth = 32 * debouncedSettings.screenX - 6;
            targetHeight = 32 * debouncedSettings.screenY - 6;
        } else {
            targetWidth = spec.width * debouncedSettings.screenX;
            targetHeight = spec.height * debouncedSettings.screenY;
        }

        // Create ImageBitmap from the image (async, lightweight on main thread)
        createImageBitmap(image).then(bitmap => {
            // Create crop worker if not exists (using shared worker)
            if (!cropWorkerRef.current) {
                cropWorkerRef.current = new Worker(
                    new URL('@/lib/image-processing/crop-worker.ts', import.meta.url)
                );
            }

            // Handle worker response - worker only crops, pica resizes
            cropWorkerRef.current.onmessage = async (e) => {
                const { type, imageData, error } = e.data;
                if (type === 'success') {
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

                            // Extract resized data
                            const destCtx = destCanvas.getContext('2d', { willReadFrequently: true });
                            if (!destCtx) throw new Error('Failed to get dest context');
                            const resizedData = destCtx.getImageData(0, 0, targetWidth, targetHeight);
                            setCachedImageData(resizedData);
                        } catch (err) {
                            console.error('Pica resize failed:', err);
                            // Fallback: just use cropped data without resize
                            setCachedImageData(imageData);
                        }
                    };

                    // Use requestIdleCallback if available, otherwise setTimeout
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => runPicaResize());
                    } else {
                        setTimeout(() => runPicaResize(), 0);
                    }
                } else {
                    console.error('Crop worker failed:', error);
                }
            };

            // Send to worker - bitmap is transferred (zero-copy)
            cropWorkerRef.current.postMessage({
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
    }, [completedCrop, debouncedSettings.displaySize, debouncedSettings.screenX, debouncedSettings.screenY]);

    // Initialize logic generator worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/logic-generator.worker.ts', import.meta.url));

        workerRef.current.onmessage = (e) => {
            const { type, payload, error } = e.data;

            if (type === 'success') {
                if (payload.previewBitmap) {
                    setPreviewBitmap(prev => {
                        if (prev) prev.close();
                        return payload.previewBitmap;
                    });
                }
                setGeneratedCode(payload.generatedCode);
                setStats(payload.stats);

                if (payload.anyScreenExceeds && debouncedSettings.processorCount === 1) {
                    toast.warning(
                        <Tran
                            text="generator-logic-display.warning-too-many-pixels"
                        />
                    );
                }
            } else if (type === 'error') {
                console.error('Worker error:', error);
                toast.error(
                    <Tran
                        text="generator-logic-display.error-process"
                    />
                );
            }

            setIsProcessing(false);
        };

        return () => {
            workerRef.current?.terminate();
            cropWorkerRef.current?.terminate();
        };
    }, [debouncedSettings.processorCount]);

    useEffect(() => {
        if (!cachedImageData) {
            setPreviewBitmap(prev => {
                if (prev) prev.close();
                return null;
            });
            setGeneratedCode([]);
            setSchematicFiles([]);
            setStats({ pixelCount: 0, instructionCount: 0, processorCount: 0 });
            return;
        }

        setIsProcessing(true);

        workerRef.current?.postMessage({
            imageData: cachedImageData,
            settings: debouncedSettings
        });

    }, [cachedImageData, debouncedSettings, setSchematicFiles]);

    // Auto-switch back to canvas preview when settings or crop changes
    useEffect(() => {
        if (previewMode === 'schematic') {
            setPreviewMode('canvas');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSettings.displaySize, debouncedSettings.screenX, debouncedSettings.screenY,
    debouncedSettings.compressionLevel, debouncedSettings.scalingMode, completedCrop]);

    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas || !previewBitmap) return;

        const processor = new GridProcessor();
        const spec = DISPLAY_SPECS[debouncedSettings.displaySize];

        // Use bitmap size for canvas to ensure 1:1 mapping (handles gaps in tiled display)
        canvas.width = previewBitmap.width;
        canvas.height = previewBitmap.height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(previewBitmap, 0, 0);

            if (showGrid) {
                const screenCount = debouncedSettings.screenX * debouncedSettings.screenY;
                const borderUrl = (spec as any).borderImageUrl;
                const borderImg = new Image();

                // Determine gap based on display type for grid alignment
                let gap = 0;
                if (debouncedSettings.displaySize === '26x26') {
                    gap = 6; // 32 - 26
                }

                if (borderUrl) {
                    borderImg.src = borderUrl;
                    borderImg.onload = () => {
                        if (!previewBitmap || previewBitmap.width === 0) return;
                        try {
                            ctx.drawImage(previewBitmap, 0, 0);
                        } catch (e) {
                            console.warn('Failed to draw preview bitmap:', e);
                            return;
                        }

                        for (let index = 0; index < screenCount; index++) {
                            const [gx, gy] = processor.getGridPosition(index, debouncedSettings.screenX);
                            const offsetX = gx * (spec.width + gap);
                            const offsetY = gy * (spec.height + gap);

                            ctx.drawImage(borderImg, offsetX, offsetY, spec.width, spec.height);
                            drawLabel(ctx, index, screenCount, offsetX, offsetY);
                        }
                    };
                } else {
                    if (spec.type !== 'tile-logic-display') {
                        for (let index = 0; index < screenCount; index++) {
                            const [gx, gy] = processor.getGridPosition(index, debouncedSettings.screenX);
                            const offsetX = gx * (spec.width + gap);
                            const offsetY = gy * (spec.height + gap);

                            ctx.strokeStyle = '#444';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(offsetX - 0.5, offsetY - 0.5, spec.width + 1, spec.height + 1);

                            drawLabel(ctx, index, screenCount, offsetX, offsetY);
                        }
                    }
                }
            }
        }
    }, [previewBitmap, showGrid, debouncedSettings.displaySize, debouncedSettings.screenX, debouncedSettings.screenY]);

    const drawLabel = (ctx: CanvasRenderingContext2D, index: number, count: number, x: number, y: number) => {
        if (count > 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 12px sans-serif';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 2;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`${index + 1}`, x + 4, y + 4);
            ctx.shadowBlur = 0;
        }
    };

    const handleGenerateSchematic = useCallback(async () => {
        if (!generatedCode.length || !imageFile) return;

        setIsProcessing(true);
        setGenerationProgress(0);
        isCancelledRef.current = false;
        try {
            const baseFilename = (imageFile.name || 'image').replace(/\.[^/.]+$/, "");
            const screenType = DISPLAY_SPECS[debouncedSettings.displaySize].type;

            const writer = new SchematicWriter(
                generatedCode,
                debouncedSettings.screenName,
                screenType,
                baseFilename,
                'Created with Mindustry Tool Logic Display Generator\nhttps://mindustry-tool.com/tools/logic-display-generator',
                debouncedSettings.screenX,
                debouncedSettings.screenY
            );

            const blob = await writer.generate((progress) => {
                setGenerationProgress(Math.round(progress * 100));
            });

            if (!blob) {
                if (isCancelledRef.current) {
                    toast.info(t('generator-logic-display.generation-cancelled'));
                    return;
                }
                throw new Error('Failed to generate schematic - processors out of range');
            }

            setSchematicFiles([{
                blob,
                filename: `${baseFilename}.msch`
            }]);

            // Switch to schematic preview mode
            setPreviewMode('schematic');

            toast.success(
                <Tran
                    text="generator-logic-disply.success-schematic"
                />
            );
        } catch (error) {
            console.error('Failed to generate schematic:', error);
            toast.error(
                <Tran
                    text="generator-logic-display.error-schematic"
                />
            );
        } finally {
            setIsProcessing(false);
        }
    }, [generatedCode, imageFile, debouncedSettings.displaySize, debouncedSettings.screenX, debouncedSettings.screenY, debouncedSettings.screenName, setSchematicFiles]);

    const handleCancelGeneration = useCallback(() => {
        isCancelledRef.current = true;
        setIsProcessing(false);
        setGenerationProgress(0);
    }, []);



    return (
        <PageWrapper className="gap-1 p-1">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
            />

            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                    <Tran text="generator-logic-display.title" />
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                    <Tran
                        text="generator-logic-display.description"
                    />
                </p>
            </div>

            <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
                <DisplayCropPreview
                    imageFile={imageFile}
                    imageSrc={imageSrc}
                    setImageFile={setImageFile}
                    crop={crop}
                    setCrop={setCrop}
                    setCompletedCrop={setCompletedCrop}
                    cropAspectRatio={cropAspectRatio}
                    containerRef={containerRef}
                    containerSize={containerSize}
                    imgRef={imgRef}
                    onImageLoad={onImageLoad}
                    onTriggerChangeImage={() => fileInputRef.current?.click()}
                    settings={settings}
                />

                <DisplayCanvasPreview
                    showGrid={showGrid}
                    setShowGrid={setShowGrid}
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                    previewCanvasRef={previewCanvasRef}
                    previewBitmap={previewBitmap}
                    isProcessing={isProcessing}
                    generationProgress={generationProgress}
                    onCancelGeneration={handleCancelGeneration}
                    schematicFiles={schematicFiles}
                    onDownload={handleDownload}
                    onCopyClick={handleCopyClick}
                    imageFile={imageFile}
                />

                <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0 col-span-2 lg:col-span-1">
                    <div className="rounded-lg border p-4 lg:h-full lg:overflow-y-auto flex flex-col gap-4 min-h-0">
                        <SettingsPanel
                            settings={settings}
                            onSettingsChange={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
                            pixelCount={stats.pixelCount}
                            processorCount={stats.processorCount}
                            imageFile={imageFile}
                            imageWidth={cachedImageData?.width}
                            imageHeight={cachedImageData?.height}
                            showOutputInfo={false}
                            className="border-0 p-0 shadow-none"
                            onGenerate={handleGenerateSchematic}
                            isProcessing={isProcessing}
                            canGenerate={!!generatedCode.length && !isProcessing}
                            onReset={handleReset}
                        >
                            {previewBitmap && imageFile && (() => {
                                const spec = DISPLAY_SPECS[debouncedSettings.displaySize];
                                const pixelWidth = debouncedSettings.screenX * spec.width;
                                const pixelHeight = debouncedSettings.screenY * spec.height;
                                return (
                                    <OutputInfoPanel
                                        info={{
                                            width: pixelWidth,
                                            height: pixelHeight,
                                            fileCount: schematicFiles.length || 1,
                                            sourceFile: {
                                                name: imageFile.name,
                                                originalWidth: imgRef.current?.naturalWidth || 0,
                                                originalHeight: imgRef.current?.naturalHeight || 0,
                                                sizeBytes: imageFile.size,
                                            },
                                            logicDisplay: {
                                                screenType: debouncedSettings.displaySize,
                                                screenGridX: debouncedSettings.screenX,
                                                screenGridY: debouncedSettings.screenY,
                                                processorCount: stats.processorCount,
                                                instructionCount: stats.instructionCount,
                                            },
                                        }}
                                        thresholds={{
                                            maxDimension: 1024,
                                            warnDimension: 800,
                                        }}
                                        unit="pixels"
                                        generatorName="Logic Display Generator"
                                    />
                                );
                            })()}

                        </SettingsPanel>
                    </div>
                </div>
            </div>
            {/* Copy Dialog - using shared component */}
            <CopyDialog
                open={showCopyDialog}
                onOpenChange={setShowCopyDialog}
                files={schematicFiles}
                onCopy={handleCopy}
                translationPrefix="generator-logic-display"
            />
        </PageWrapper>
    );
}
