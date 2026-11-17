import type { RGB, DitheringEngine, DitheringSettings } from '../types';
import { findClosestColor } from '../color-space';

/**
 * No dithering - simple nearest color matching
 */
export class NoDithering implements DitheringEngine {
    apply(imageData: ImageData, palette: RGB[], settings: DitheringSettings): ImageData {
        const { width, height } = imageData;
        const data = new Uint8ClampedArray(imageData.data);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
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
            }
        }

        return new ImageData(data, width, height);
    }
}
