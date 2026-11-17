import type { RGB, DitheringEngine, DitheringSettings } from '../types';
import { findClosestColor } from '../color-space';

/**
 * Atkinson dithering
 * Developed by Bill Atkinson for original Macintosh
 * Preserves brightness better, creates lighter images
 * 
 * Error distribution pattern (only diffuses 3/4 of error):
 *       X   1/8 1/8
 *   1/8 1/8 1/8
 *       1/8
 * 
 * Supports serpentine scanning to reduce banding artifacts
 */
export class AtkinsonDithering implements DitheringEngine {
    apply(imageData: ImageData, palette: RGB[], settings: DitheringSettings): ImageData {
        const { width, height } = imageData;
        const data = new Uint8ClampedArray(imageData.data);
        const strength = settings.strength;
        const serpentine = settings.serpentine ?? true;

        for (let y = 0; y < height; y++) {
            const direction = serpentine && (y % 2 === 1) ? -1 : 1;
            const xStart = direction === 1 ? 0 : width - 1;
            const xEnd = direction === 1 ? width : -1;

            for (let x = xStart; x !== xEnd; x += direction) {
                const idx = (y * width + x) * 4;

                const oldR = data[idx]!;
                const oldG = data[idx + 1]!;
                const oldB = data[idx + 2]!;
                const alpha = data[idx + 3]!;

                if (alpha < 128) continue;

                const { color: newColor } = findClosestColor(
                    [oldR, oldG, oldB],
                    palette,
                    settings.colorSpace
                );

                data[idx] = newColor[0];
                data[idx + 1] = newColor[1];
                data[idx + 2] = newColor[2];

                // Calculate error (only diffuse 3/4)
                const errR = (oldR - newColor[0]) * strength;
                const errG = (oldG - newColor[1]) * strength;
                const errB = (oldB - newColor[2]) * strength;

                // Distribute to 6 neighbors (1/8 each)
                const fraction = 1 / 8;
                this.addError(data, width, height, x + direction, y, errR * fraction, errG * fraction, errB * fraction);
                this.addError(data, width, height, x + 2 * direction, y, errR * fraction, errG * fraction, errB * fraction);
                this.addError(data, width, height, x - direction, y + 1, errR * fraction, errG * fraction, errB * fraction);
                this.addError(data, width, height, x, y + 1, errR * fraction, errG * fraction, errB * fraction);
                this.addError(data, width, height, x + direction, y + 1, errR * fraction, errG * fraction, errB * fraction);
                this.addError(data, width, height, x, y + 2, errR * fraction, errG * fraction, errB * fraction);
            }
        }

        return new ImageData(data, width, height);
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

