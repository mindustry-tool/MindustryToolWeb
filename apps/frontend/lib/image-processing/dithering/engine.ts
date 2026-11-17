import type { DitheringAlgorithm, DitheringEngine, DitheringSettings, RGB } from './types';
import { OrderedDithering } from './algorithms/ordered';
import { NoDithering } from './algorithms/none';
import { FloydSteinbergDithering } from './algorithms/floyd-steinberg';
import { AtkinsonDithering } from './algorithms/atkinson';
import { StuckiDithering } from './algorithms/stucki';
import { SierraDithering } from './algorithms/sierra';

/**
 * Factory for creating dithering engine instances
 */
export class DitheringEngineFactory {
    private static engines = new Map<DitheringAlgorithm, DitheringEngine>([
        ['ordered', new OrderedDithering()],
        ['none', new NoDithering()],
        ['floyd-steinberg', new FloydSteinbergDithering()],
        ['atkinson', new AtkinsonDithering()],
        ['stucki', new StuckiDithering()],
        ['sierra', new SierraDithering()]
    ]);

    /**
     * Get dithering engine for specified algorithm
     */
    static create(algorithm: DitheringAlgorithm): DitheringEngine {
        const engine = this.engines.get(algorithm);
        if (!engine) {
            throw new Error(`Unknown dithering algorithm: ${algorithm}`);
        }
        return engine;
    }
}

/**
 * Apply dithering to image data
 * Main entry point for dithering operations
 * 
 * @param imageData - Source image data
 * @param palette - Available colors in RGB format
 * @param settings - Dithering configuration
 * @returns Dithered image data
 */
export function applyDithering(
    imageData: ImageData,
    palette: RGB[],
    settings: DitheringSettings
): ImageData {
    if (palette.length === 0) {
        throw new Error('Palette cannot be empty');
    }

    // Skip dithering if strength is 0 or algorithm is 'none'
    if (settings.strength === 0 || settings.algorithm === 'none') {
        const engine = new NoDithering();
        return engine.apply(imageData, palette, settings);
    }

    const engine = DitheringEngineFactory.create(settings.algorithm);
    return engine.apply(imageData, palette, settings);
}

/**
 * Helper to convert hex colors to RGB for palette
 */
export function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) {
        return [0, 0, 0];
    }
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}
