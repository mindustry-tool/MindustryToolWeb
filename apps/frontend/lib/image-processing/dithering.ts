import type { MindustryMaterial, PixelGrid } from '@/lib/tools';
import type { RGB } from './dithering/types';
import { colorDistance, hexToRgb } from './color-utils';

/**
 * Find the closest material color for a given RGB value
 */
export function findClosestMaterial(rgb: RGB, materials: MindustryMaterial[]): MindustryMaterial {
    if (materials.length === 0) {
        throw new Error('No materials provided');
    }

    let closestMaterial = materials[0];
    let minDistance = Infinity;

    for (const material of materials) {
        const materialRgb = hexToRgb(material.color);
        const distance = colorDistance(rgb, materialRgb);

        if (distance < minDistance) {
            minDistance = distance;
            closestMaterial = material;
        }
    }

    return closestMaterial!;
}

/**
 * Generate a pixel grid from canvas, mapping each pixel to the closest material
 * @param canvas - Source canvas with image data
 * @param blockSize - Size of each block in pixels
 * @param selectedMaterials - Available materials to map colors to
 * @param dithering - Whether to apply Floyd-Steinberg dithering (default: false)
 * @returns Pixel grid with material assignments
 */
export function generatePixelGrid(
    canvas: HTMLCanvasElement,
    blockSize: number,
    selectedMaterials: MindustryMaterial[],
    dithering: boolean = false,
): PixelGrid {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    const width = Math.floor(canvas.width / blockSize);
    const height = Math.floor(canvas.height / blockSize);

    // Create a temporary canvas to resize the image to the grid size
    // This simplifies the dithering process as we work 1:1 with pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) throw new Error('Failed to get temp canvas context');

    // Draw original image resized to grid dimensions
    tempCtx.drawImage(canvas, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const grid: PixelGrid = [];

    // Initialize grid
    for (let y = 0; y < height; y++) {
        grid[y] = new Array(width).fill(null);
    }

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
            const material = findClosestMaterial([oldR, oldG, oldB], selectedMaterials);
            const materialRgb = hexToRgb(material.color);

            if (grid[y]) {
                grid[y]![x] = {
                    material: material.name,
                    x,
                    y,
                };
            }

            if (dithering) {
                const quantErrorR = oldR - materialRgb[0];
                const quantErrorG = oldG - materialRgb[1];
                const quantErrorB = oldB - materialRgb[2];

                // Floyd-Steinberg Error Diffusion
                //   X   7
                // 3 5 1
                // (1/16)

                const distributeError = (dx: number, dy: number, factor: number) => {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const ni = (ny * width + nx) * 4;
                        // Don't dither into transparent pixels
                        const alpha = data[ni + 3];
                        if (alpha !== undefined && alpha >= 128) {
                            const r = data[ni];
                            const g = data[ni + 1];
                            const b = data[ni + 2];
                            if (r !== undefined)
                                data[ni] = Math.min(255, Math.max(0, r + quantErrorR * factor));
                            if (g !== undefined)
                                data[ni + 1] = Math.min(255, Math.max(0, g + quantErrorG * factor));
                            if (b !== undefined)
                                data[ni + 2] = Math.min(255, Math.max(0, b + quantErrorB * factor));
                        }
                    }
                };

                distributeError(1, 0, 7 / 16);
                distributeError(-1, 1, 3 / 16);
                distributeError(0, 1, 5 / 16);
                distributeError(1, 1, 1 / 16);
            }
        }
    }

    return grid;
}
