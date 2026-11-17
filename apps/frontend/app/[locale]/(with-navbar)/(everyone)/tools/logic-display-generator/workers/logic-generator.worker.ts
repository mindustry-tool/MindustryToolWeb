import { ColorCompressor } from '../lib/color-compressor';
// Force worker rebuild to pick up logic-code-generator changes (Smart Optimization + Dithering + Gap Removal)
import { DISPLAY_SPECS } from '../lib/constants';
import { GridProcessor } from '../lib/grid-processor';
import { estimateInstructionCount, fitsInSingleProcessor, generateLogicCode } from '../lib/logic-code-generator';
import type { GeneratorSettings, PixelData } from '../lib/types';

self.onmessage = async (e: MessageEvent) => {
    const { imageData, settings } = e.data as {
        imageData: ImageData;
        settings: GeneratorSettings;
    };

    try {
        // Apply compression and dithering if needed
        if (settings.compressionLevel > 0) {
            const compressor = new ColorCompressor();

            // Apply dithering BEFORE compression (or during? actually ColorCompressor.ditherImageData does both quantization and error diffusion)
            // Wait, my implementation of ditherImageData does quantization AND error diffusion.
            // So if dithering is ON, we use ditherImageData.
            // If dithering is OFF, we use compressImageData.

            if (settings.dithering.algorithm !== 'none') {
                compressor.ditherImageData(imageData, settings.compressionLevel as any);
            } else {
                compressor.compressImageData(imageData, settings.compressionLevel as any);
            }
        }

        // Process screens
        const processor = new GridProcessor();
        const gridSettings = {
            screenX: settings.screenX,
            screenY: settings.screenY,
            ignoreBorder: settings.ignoreBorder,
            bezelCompensation: settings.bezelCompensation
        };

        let screens: PixelData[][];

        if (settings.displaySize === '26x26') {
            // TILE DISPLAY: imageData is already pre-resized by pica to exact mega screen size
            // Just convert to PixelData array directly
            const megaWidth = imageData.width;
            const megaHeight = imageData.height;

            const pixels: PixelData[] = [];
            for (let y = 0; y < megaHeight; y++) {
                for (let x = 0; x < megaWidth; x++) {
                    const idx = (y * megaWidth + x) * 4;
                    const a = imageData.data[idx + 3] as number;
                    // Only include non-transparent pixels
                    if (a > 2) {
                        pixels.push({
                            x, y,
                            r: imageData.data[idx] as number,
                            g: imageData.data[idx + 1] as number,
                            b: imageData.data[idx + 2] as number,
                            a,
                        });
                    }
                }
            }

            // Return as single "screen"
            screens = [pixels];
        } else {
            // NORMAL/LARGE DISPLAY: Split into grid
            screens = processor.splitImageToGrid(imageData, settings.displaySize, gridSettings);
        }

        const anyScreenExceeds = screens.some(screen =>
            !fitsInSingleProcessor(screen, settings.usePackedColors));

        // Generate mlog code
        const code = generateLogicCode(
            screens,
            settings.displaySize,
            settings.processorCount,
            settings.usePackedColors,
            settings.screenName
        );


        const pixelCount = screens.reduce((sum, screen) => sum + screen.length, 0);
        const instructionCount = screens.reduce((sum, screen) => sum + estimateInstructionCount(screen, settings.usePackedColors), 0);

        // --- RENDER PREVIEW ---
        // We render the preview here to avoid freezing the main thread with thousands of fillRect calls
        // --- RENDER PREVIEW ---
        // We render the preview here to avoid freezing the main thread with thousands of fillRect calls
        const spec = DISPLAY_SPECS[settings.displaySize];

        let totalWidth: number;
        let totalHeight: number;
        let gap = 0;

        if (settings.displaySize === '26x26') {
            // For tiled display, we use the mega screen size which includes gaps
            totalWidth = 32 * settings.screenX - 6;
            totalHeight = 32 * settings.screenY - 6;
            gap = 6; // 32 - 26
        } else {
            totalWidth = settings.screenX * spec.width + (settings.screenX - 1) * gap;
            totalHeight = settings.screenY * spec.height + (settings.screenY - 1) * gap;
        }

        let previewCanvas: OffscreenCanvas;
        let ctx: OffscreenCanvasRenderingContext2D;

        if (typeof OffscreenCanvas !== 'undefined') {
            previewCanvas = new OffscreenCanvas(totalWidth, totalHeight);
            ctx = previewCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        } else {
            throw new Error('OffscreenCanvas not supported');
        }

        // Clear background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw screens
        screens.forEach((screenPixels, index) => {
            const [gx, gy] = processor.getGridPosition(index, settings.screenX);
            const offsetX = gx * (spec.width + gap);
            const offsetY = gy * (spec.height + gap);

            // Draw screen background
            ctx.fillStyle = '#000';
            ctx.fillRect(offsetX, offsetY, spec.width, spec.height);

            // Draw pixels
            for (const pixel of screenPixels) {
                const { r, g, b, a, x, y } = pixel;
                ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a / 255})`;
                ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
            }
        });

        const previewBitmap = previewCanvas.transferToImageBitmap();

        (self as any).postMessage({
            type: 'success',
            payload: {
                generatedCode: code,
                previewBitmap,
                anyScreenExceeds,
                stats: {
                    pixelCount,
                    instructionCount,
                    processorCount: settings.displaySize === '26x26'
                        ? settings.screenX * settings.screenY
                        : screens.length
                }
            }
        }, [previewBitmap]);

    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown worker error'
        });
    }
};
