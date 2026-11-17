import type { RGB, DitheringEngine, DitheringSettings } from '../types';
import { findClosestColor } from '../color-space';

/**
 * Ordered (Bayer matrix) dithering
 * Fast, deterministic pattern-based dithering
 * Creates retro/vintage aesthetic similar to old games
 */
export class OrderedDithering implements DitheringEngine {
    // 4x4 Bayer threshold matrix
    private readonly bayerMatrix = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];

    private readonly matrixSize = 4;

    apply(imageData: ImageData, palette: RGB[], settings: DitheringSettings): ImageData {
        const { width, height } = imageData;
        const data = new Uint8ClampedArray(imageData.data);
        const strength = settings.strength;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                const oldR = data[idx]!;
                const oldG = data[idx + 1]!;
                const oldB = data[idx + 2]!;
                const alpha = data[idx + 3]!;

                if (alpha < 128) continue;

                // Get Bayer threshold for this pixel
                const threshold = this.bayerMatrix[y % this.matrixSize]![x % this.matrixSize]! / 16;

                // Apply threshold-based dithering
                const adjustedR = oldR + (threshold - 0.5) * 32 * strength;
                const adjustedG = oldG + (threshold - 0.5) * 32 * strength;
                const adjustedB = oldB + (threshold - 0.5) * 32 * strength;

                const { color: newColor } = findClosestColor(
                    [
                        Math.max(0, Math.min(255, adjustedR)),
                        Math.max(0, Math.min(255, adjustedG)),
                        Math.max(0, Math.min(255, adjustedB))
                    ],
                    palette,
                    settings.colorSpace
                );

                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];
            }
        }

        return new ImageData(data, width, height);
    }
}
