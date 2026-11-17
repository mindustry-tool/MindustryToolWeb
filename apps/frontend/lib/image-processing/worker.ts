// Web Worker for image processing
// Handles CPU-intensive operations without blocking main thread

import type { MindustryMaterial, PixelGrid } from '@/lib/tools';
import type { DitheringSettings, RGB } from './dithering/types';
import { applyDithering, hexToRgb as hexToRgbDither } from './dithering/index';

// ===== Type Definitions =====

export type WorkerJobType = 'generateGrid';

export interface WorkerJob {
    type: WorkerJobType;
    jobId: string;
    imageData: ImageData;
    settings: {
        materials: MindustryMaterial[];
        dithering: boolean;
        advancedDithering?: boolean;
        advancedDitheringSettings?: DitheringSettings;
        blockSize?: number; // For sorter generator (defaults to 1 for canvas)
        sharpen?: boolean; // Apply pre-sharpening before resize (default: true)
        sharpenStrength?: number; // Sharpening strength 0.5-2.0 (default: 1.0)
    };
}

export type WorkerProgressStep = 'resize' | 'map-colors' | 'dithering' | 'complete';

export interface WorkerProgress {
    type: 'progress';
    jobId: string;
    step: WorkerProgressStep;
    progress: number; // 0-100
    message?: string;
}

export interface WorkerComplete {
    type: 'complete';
    jobId: string;
    grid: PixelGrid;
    previewData: ImageData;
    stats: {
        width: number;
        height: number;
        pixelCount: number;
    };
}

export interface WorkerError {
    type: 'error';
    jobId: string;
    error: string;
}

export type WorkerResponse = WorkerProgress | WorkerComplete | WorkerError;

// ===== Utility Functions (copied from shared modules for worker isolation) =====

function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) {
        return [0, 0, 0];
    }
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function weightedColorDistance(rgb1: RGB, rgb2: RGB): number {
    const r1 = rgb1[0];
    const r2 = rgb2[0];
    const rDiff = r1 - r2;
    const gDiff = rgb1[1] - rgb2[1];
    const bDiff = rgb1[2] - rgb2[2];
    const rMean = (r1 + r2) / 2;

    return Math.sqrt(
        (2 + rMean / 256) * rDiff * rDiff +
        4 * gDiff * gDiff +
        (2 + (255 - rMean) / 256) * bDiff * bDiff
    );
}

function findClosestMaterial(rgb: RGB, materials: MindustryMaterial[]): MindustryMaterial {
    if (materials.length === 0) {
        throw new Error('No materials provided');
    }

    let closestMaterial = materials[0];
    let minDistance = Infinity;

    for (const material of materials) {
        const materialRgb = hexToRgb(material.color);
        const distance = weightedColorDistance(rgb, materialRgb);

        if (distance < minDistance) {
            minDistance = distance;
            closestMaterial = material;
        }
    }

    return closestMaterial!;
}

/**
 * Apply unsharp mask sharpening filter
 * Preserves details before downscaling
 */
function applyUnsharpMask(imageData: ImageData, strength: number = 1.0): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const outData = output.data;

    // Gaussian blur kernel (3x3 approximation)
    const kernel = [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
    ];
    const kernelSum = 16;

    // Apply sharpening
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // Get original pixel
            const origR = data[idx]!;
            const origG = data[idx + 1]!;
            const origB = data[idx + 2]!;
            const origA = data[idx + 3]!;

            // Skip transparent pixels
            if (origA < 128) {
                outData[idx] = origR;
                outData[idx + 1] = origG;
                outData[idx + 2] = origB;
                outData[idx + 3] = origA;
                continue;
            }

            // Apply blur kernel
            let blurR = 0, blurG = 0, blurB = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const px = Math.max(0, Math.min(width - 1, x + kx));
                    const py = Math.max(0, Math.min(height - 1, y + ky));
                    const pidx = (py * width + px) * 4;
                    const weight = kernel[(ky + 1) * 3 + (kx + 1)]!;

                    blurR += data[pidx]! * weight;
                    blurG += data[pidx + 1]! * weight;
                    blurB += data[pidx + 2]! * weight;
                }
            }

            blurR /= kernelSum;
            blurG /= kernelSum;
            blurB /= kernelSum;

            // Unsharp mask: original + strength * (original - blurred)
            outData[idx] = Math.max(0, Math.min(255, origR + strength * (origR - blurR)));
            outData[idx + 1] = Math.max(0, Math.min(255, origG + strength * (origG - blurG)));
            outData[idx + 2] = Math.max(0, Math.min(255, origB + strength * (origB - blurB)));
            outData[idx + 3] = origA;
        }
    }

    return output;
}

// ===== Progress Reporting =====

function reportProgress(jobId: string, step: WorkerProgressStep, progress: number, message?: string) {
    const response: WorkerProgress = {
        type: 'progress',
        jobId,
        step,
        progress,
        message,
    };
    self.postMessage(response);
}

// ===== Main Processing Function =====

function processImage(job: WorkerJob): void {
    const { jobId, imageData, settings } = job;
    const { materials, dithering } = settings;
    const blockSize = settings.blockSize ?? 1; // Default to 1 for canvas, configurable for sorter
    const sharpen = settings.sharpen ?? true; // Default to enabled
    const sharpenStrength = settings.sharpenStrength ?? 1.0;

    try {
        // Step 0: Apply pre-sharpening if enabled (preserves details before downscaling)
        let processedImageData = imageData;
        if (sharpen && sharpenStrength > 0) {
            reportProgress(jobId, 'resize', 5, 'Sharpening image...');
            processedImageData = applyUnsharpMask(imageData, sharpenStrength);
        }

        // Step 1: Resize to grid dimensions
        reportProgress(jobId, 'resize', 10, 'Resizing image...');

        const width = Math.floor(imageData.width / blockSize);
        const height = Math.floor(imageData.height / blockSize);

        // Create resized image data
        const resizedImageData = new ImageData(width, height);
        const data = resizedImageData.data;
        const sourceData = processedImageData.data;
        const sourceWidth = processedImageData.width;

        // Manual area averaging for better downscaling quality
        // This preserves details better than standard canvas resizing
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;

                const startX = x * blockSize;
                const startY = y * blockSize;

                for (let py = 0; py < blockSize; py++) {
                    for (let px = 0; px < blockSize; px++) {
                        const sx = startX + px;
                        const sy = startY + py;

                        if (sx < processedImageData.width && sy < processedImageData.height) {
                            const i = (sy * sourceWidth + sx) * 4;
                            rSum += sourceData[i]!;
                            gSum += sourceData[i + 1]!;
                            bSum += sourceData[i + 2]!;
                            aSum += sourceData[i + 3]!;
                            count++;
                        }
                    }
                }

                const i = (y * width + x) * 4;
                if (count > 0) {
                    data[i] = Math.floor(rSum / count);
                    data[i + 1] = Math.floor(gSum / count);
                    data[i + 2] = Math.floor(bSum / count);
                    data[i + 3] = Math.floor(aSum / count);
                }
            }
        }

        reportProgress(jobId, 'resize', 30, 'Image resized');

        // Step 2: Initialize grid
        const grid: PixelGrid = [];
        for (let y = 0; y < height; y++) {
            grid[y] = new Array(width).fill(null);
        }

        // Step 3: Map colors to materials
        reportProgress(jobId, 'map-colors', 40, 'Mapping colors...');

        const totalPixels = width * height;
        let processedPixels = 0;

        // Check if advanced dithering is enabled
        if (settings.advancedDithering && settings.advancedDitheringSettings) {
            // BETA: Use new dithering library
            reportProgress(jobId, 'dithering', 45, 'Applying advanced dithering...');

            const palette = materials.map(m => hexToRgbDither(m.color));
            const ditheredData = applyDithering(resizedImageData, palette, settings.advancedDitheringSettings);

            reportProgress(jobId, 'map-colors', 75, 'Mapping dithered colors...');

            // Map dithered pixels to materials
            const ditheredPixels = ditheredData.data;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;

                    // Skip transparent pixels
                    if ((ditheredPixels[i + 3] ?? 0) < 128) {
                        if (grid[y]) grid[y]![x] = null;
                        continue;
                    }

                    const r = ditheredPixels[i]!;
                    const g = ditheredPixels[i + 1]!;
                    const b = ditheredPixels[i + 2]!;

                    // Find closest material (dithering already applied)
                    const material = findClosestMaterial([r, g, b], materials);

                    if (grid[y]) {
                        grid[y]![x] = {
                            material: material.name,
                            x,
                            y,
                        };
                    }

                    processedPixels++;
                }
            }
        } else {
            // Legacy dithering implementation

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;

                    // Skip transparent pixels
                    if ((data[i + 3] ?? 0) < 128) {
                        if (grid[y]) grid[y]![x] = null;
                        continue;
                    }

                    const oldR = data[i]!;
                    const oldG = data[i + 1]!;
                    const oldB = data[i + 2]!;

                    // Find closest material
                    const material = findClosestMaterial([oldR, oldG, oldB], materials);
                    const materialRgb = hexToRgb(material.color);

                    if (grid[y]) {
                        grid[y]![x] = {
                            material: material.name,
                            x,
                            y,
                        };
                    }

                    // Apply dithering if enabled
                    if (dithering) {
                        const quantErrorR = oldR - materialRgb[0];
                        const quantErrorG = oldG - materialRgb[1];
                        const quantErrorB = oldB - materialRgb[2];

                        // Floyd-Steinberg error diffusion
                        const distributeError = (dx: number, dy: number, factor: number) => {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const ni = (ny * width + nx) * 4;
                                const alpha = data[ni + 3];
                                if (alpha !== undefined && alpha >= 128) {
                                    const r = data[ni];
                                    const g = data[ni + 1];
                                    const b = data[ni + 2];
                                    if (r !== undefined) data[ni] = Math.min(255, Math.max(0, r + quantErrorR * factor));
                                    if (g !== undefined) data[ni + 1] = Math.min(255, Math.max(0, g + quantErrorG * factor));
                                    if (b !== undefined) data[ni + 2] = Math.min(255, Math.max(0, b + quantErrorB * factor));
                                }
                            }
                        };

                        distributeError(1, 0, 7 / 16);
                        distributeError(-1, 1, 3 / 16);
                        distributeError(0, 1, 5 / 16);
                        distributeError(1, 1, 1 / 16);
                    }

                    processedPixels++;

                    // Report progress every 10%
                    if (processedPixels % Math.floor(totalPixels / 10) === 0) {
                        const progress = 40 + Math.floor((processedPixels / totalPixels) * 50);
                        reportProgress(jobId, dithering ? 'dithering' : 'map-colors', progress);
                    }
                }
            }
        }

        reportProgress(jobId, 'complete', 95, 'Finalizing...');

        // Step 4: Send result
        const response: WorkerComplete = {
            type: 'complete',
            jobId,
            grid,
            previewData: resizedImageData,
            stats: {
                width,
                height,
                pixelCount: processedPixels,
            },
        };

        self.postMessage(response);
    } catch (error) {
        const errorResponse: WorkerError = {
            type: 'error',
            jobId,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        self.postMessage(errorResponse);
    }
}

// ===== Worker Message Handler =====

self.addEventListener('message', (event: MessageEvent<WorkerJob>) => {
    const job = event.data;

    if (job.type === 'generateGrid') {
        processImage(job);
    }
});

