import type { RGB, DitheringEngine, DitheringSettings } from '../types';
import { findClosestColor } from '../color-space';

/**
 * Stucki dithering
 * Wider error diffusion pattern than Floyd-Steinberg
 * Produces smoother gradients at cost of performance
 * 
 * Error distribution pattern:
 *           X   8/42 4/42
 *   2/42 4/42 8/42 4/42 2/42
 *   1/42 2/42 4/42 2/42 1/42
 * 
 * Supports serpentine scanning to reduce banding artifacts
 */
export class StuckiDithering implements DitheringEngine {
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

                const errR = (oldR - newColor[0]) * strength;
                const errG = (oldG - newColor[1]) * strength;
                const errB = (oldB - newColor[2]) * strength;

                // Distribute error with Stucki weights (adjusted for direction)
                this.addError(data, width, height, x + direction, y, errR * 8 / 42, errG * 8 / 42, errB * 8 / 42);
                this.addError(data, width, height, x + 2 * direction, y, errR * 4 / 42, errG * 4 / 42, errB * 4 / 42);

                this.addError(data, width, height, x - 2 * direction, y + 1, errR * 2 / 42, errG * 2 / 42, errB * 2 / 42);
                this.addError(data, width, height, x - direction, y + 1, errR * 4 / 42, errG * 4 / 42, errB * 4 / 42);
                this.addError(data, width, height, x, y + 1, errR * 8 / 42, errG * 8 / 42, errB * 8 / 42);
                this.addError(data, width, height, x + direction, y + 1, errR * 4 / 42, errG * 4 / 42, errB * 4 / 42);
                this.addError(data, width, height, x + 2 * direction, y + 1, errR * 2 / 42, errG * 2 / 42, errB * 2 / 42);

                this.addError(data, width, height, x - 2 * direction, y + 2, errR * 1 / 42, errG * 1 / 42, errB * 1 / 42);
                this.addError(data, width, height, x - direction, y + 2, errR * 2 / 42, errG * 2 / 42, errB * 2 / 42);
                this.addError(data, width, height, x, y + 2, errR * 4 / 42, errG * 4 / 42, errB * 4 / 42);
                this.addError(data, width, height, x + direction, y + 2, errR * 2 / 42, errG * 2 / 42, errB * 2 / 42);
                this.addError(data, width, height, x + 2 * direction, y + 2, errR * 1 / 42, errG * 1 / 42, errB * 1 / 42);
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

