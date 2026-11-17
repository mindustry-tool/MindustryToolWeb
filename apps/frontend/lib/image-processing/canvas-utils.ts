import type { MindustryMaterial, PixelGrid } from '@/lib/tools';

/**
 * Resize canvas to fit within max dimensions while maintaining aspect ratio
 */
export function resizeCanvas(
    canvas: HTMLCanvasElement,
    maxWidth: number,
    maxHeight: number,
): HTMLCanvasElement {
    const aspectRatio = canvas.width / canvas.height;

    let newWidth = canvas.width;
    let newHeight = canvas.height;

    if (canvas.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;

    const ctx = resizedCanvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    }

    return resizedCanvas;
}

/**
 * Draw pixel grid onto a canvas for preview
 * @param canvas - Target canvas to draw on
 * @param grid - Pixel grid data
 * @param materials - Available materials for color lookup
 * @param backgroundColor - Optional background color (default: transparent)
 */
export function drawPixelGrid(
    canvas: HTMLCanvasElement,
    grid: PixelGrid,
    materials: MindustryMaterial[],
    backgroundColor?: string,
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    const firstRow = grid[0];
    if (!firstRow || firstRow.length === 0) {
        return;
    }

    const blockSize = Math.floor(canvas.width / firstRow.length);
    canvas.height = grid.length * blockSize;

    // Fill background if specified
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw each pixel
    for (let y = 0; y < grid.length; y++) {
        const row = grid[y];
        if (!row) continue;

        for (let x = 0; x < row.length; x++) {
            const cell = row[x];

            // Skip null cells (transparent pixels or gaps)
            if (!cell) {
                continue;
            }

            const material = materials.find((m) => m.name === cell.material);

            if (material) {
                ctx.fillStyle = material.color;
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}
