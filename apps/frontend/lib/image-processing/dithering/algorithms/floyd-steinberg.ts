import type { RGB, DitheringEngine, DitheringSettings } from '../types';
import { findClosestColor } from '../color-space';

/**
 * Floyd-Steinberg error diffusion dithering
 * Classic algorithm with good balance of quality and performance
 * 
 * Error distribution pattern (left-to-right):
 *       X   7/16
 *   3/16 5/16 1/16
 * 
 * Supports serpentine scanning to reduce banding artifacts
 */
export class FloydSteinbergDithering implements DitheringEngine {
    apply(imageData: ImageData, palette: RGB[], settings: DitheringSettings): ImageData {
        const { width, height } = imageData;
        const data = new Uint8ClampedArray(imageData.data);
        const strength = settings.strength;
        const serpentine = settings.serpentine ?? true; // Default to true

        for (let y = 0; y < height; y++) {
            // Serpentine: even rows go left-to-right, odd rows go right-to-left
            const direction = serpentine && (y % 2 === 1) ? -1 : 1;
            const xStart = direction === 1 ? 0 : width - 1;
            const xEnd = direction === 1 ? width : -1;

            for (let x = xStart; x !== xEnd; x += direction) {
                const idx = (y * width + x) * 4;

                // Get current pixel color
                const oldR = data[idx]!;
                const oldG = data[idx + 1]!;
                const oldB = data[idx + 2]!;
                const alpha = data[idx + 3]!;

                // Skip transparent pixels
                if (alpha < 128) continue;

                // Find closest palette color
                const { color: newColor } = findClosestColor(
                    [oldR, oldG, oldB],
                    palette,
                    settings.colorSpace
                );

                // Set new color
                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];

                // Calculate quantization error
                const errR = (oldR - newColor[0]) * strength;
                const errG = (oldG - newColor[1]) * strength;
                const errB = (oldB - newColor[2]) * strength;

                // Distribute error to neighboring pixels
                this.distributeError(data, width, height, x, y, errR, errG, errB, direction);
            }
        }

        return new ImageData(data, width, height);
    }

    private distributeError(
        data: Uint8ClampedArray,
        width: number,
        height: number,
        x: number,
        y: number,
        errR: number,
        errG: number,
        errB: number,
        direction: number
    ): void {
        // Adjust error distribution based on direction
        // Direction 1 (left-to-right): standard pattern
        // Direction -1 (right-to-left): mirror pattern

        // Right/forward pixel: 7/16
        this.addError(data, width, height, x + direction, y, errR * 7 / 16, errG * 7 / 16, errB * 7 / 16);

        // Bottom-left/backward pixel: 3/16
        this.addError(data, width, height, x - direction, y + 1, errR * 3 / 16, errG * 3 / 16, errB * 3 / 16);

        // Bottom pixel: 5/16
        this.addError(data, width, height, x, y + 1, errR * 5 / 16, errG * 5 / 16, errB * 5 / 16);

        // Bottom-right/forward pixel: 1/16
        this.addError(data, width, height, x + direction, y + 1, errR * 1 / 16, errG * 1 / 16, errB * 1 / 16);
    }

    private addError(
        data: Uint8ClampedArray,
        width: number,
        height: number,
        x: number,
        y: number,
        errR: number,
        errG: number,
        errB: number
    ): void {
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        const idx = (y * width + x) * 4;
        data[idx] = Math.max(0, Math.min(255, data[idx]! + errR));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1]! + errG));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2]! + errB));
    }
}

