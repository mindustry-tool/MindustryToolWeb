import type { DisplaySize, PixelData } from './types';
import { DISPLAY_SPECS } from './constants';
import { ColorCompressor } from './color-compressor';

/**
 * Load image and extract pixel data
 */
export async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Resize image to fit Logic Display dimensions using multi-step downscaling
 * for best quality output
 */
export function resizeToDisplay(
    img: HTMLImageElement,
    displaySize: DisplaySize,
    screenX: number = 1,
    screenY: number = 1
): HTMLCanvasElement {
    const spec = DISPLAY_SPECS[displaySize];
    const targetWidth = spec.width * screenX;
    const targetHeight = spec.height * screenY;

    // Start with the original image dimensions
    let currentWidth = img.naturalWidth || img.width;
    let currentHeight = img.naturalHeight || img.height;

    // Create initial canvas from image
    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = currentWidth;
    currentCanvas.height = currentHeight;
    const currentCtx = currentCanvas.getContext('2d', { willReadFrequently: true });
    if (!currentCtx) {
        throw new Error('Failed to get canvas context');
    }
    currentCtx.drawImage(img, 0, 0);

    // Multi-step downscaling: halve dimensions until close to target
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
        const halfWidth = Math.max(Math.floor(currentWidth / 2), targetWidth);
        const halfHeight = Math.max(Math.floor(currentHeight / 2), targetHeight);

        const halfCanvas = document.createElement('canvas');
        halfCanvas.width = halfWidth;
        halfCanvas.height = halfHeight;

        const halfCtx = halfCanvas.getContext('2d', { willReadFrequently: true });
        if (!halfCtx) {
            throw new Error('Failed to get canvas context');
        }

        // Use high quality smoothing for each step
        halfCtx.imageSmoothingEnabled = true;
        halfCtx.imageSmoothingQuality = 'high';
        halfCtx.drawImage(currentCanvas, 0, 0, halfWidth, halfHeight);

        currentCanvas = halfCanvas;
        currentWidth = halfWidth;
        currentHeight = halfHeight;
    }

    // Final resize to exact target dimensions
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!finalCtx) {
        throw new Error('Failed to get canvas context');
    }

    // High quality smoothing for final step
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

    return finalCanvas;
}

/**
 * Extract pixel data from canvas
 */
export function extractPixels(
    canvas: HTMLCanvasElement,
    compressionLevel: number = 0
): PixelData[] {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Apply compression if level > 0
    if (compressionLevel > 0) {
        const compressor = new ColorCompressor();
        compressor.compressImageData(imageData, compressionLevel as any);
    }

    const pixels: PixelData[] = [];
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            if (r === undefined || g === undefined || b === undefined || a === undefined) {
                continue;
            }

            // Only include non-transparent pixels (alpha > 2)
            if (a > 2) {
                pixels.push({
                    r, // 0-255 range
                    g, // 0-255 range
                    b, // 0-255 range
                    a, // 0-255 range
                    x,
                    y
                });
            }
        }
    }

    return pixels;
}

/**
 * Process image file to pixel data
 */
export async function processImage(
    file: File,
    displaySize: DisplaySize,
    screenX: number = 1,
    screenY: number = 1,
    compressionLevel: number = 0
): Promise<PixelData[]> {
    const img = await loadImage(file);
    const canvas = resizeToDisplay(img, displaySize, screenX, screenY);
    return extractPixels(canvas, compressionLevel);
}
