export type RGB = [number, number, number];
export type LAB = [number, number, number];

/**
 * Available dithering algorithms
 */
export type DitheringAlgorithm =
    | 'floyd-steinberg'
    | 'ordered'
    | 'atkinson'
    | 'stucki'
    | 'sierra'
    | 'none';

/**
 * Color space for distance calculations
 */
export type ColorSpace = 'rgb' | 'lab';

/**
 * Dithering configuration
 */
export interface DitheringSettings {
    algorithm: DitheringAlgorithm;
    strength: number; // 0-1 (0=no dither, 1=full strength)
    colorSpace: ColorSpace;
    serpentine?: boolean; // Use serpentine (bidirectional) scanning for error diffusion (default: true)
}

/**
 * Interface for dithering algorithm implementations
 */
export interface DitheringEngine {
    /**
     * Apply dithering to image data
     * @param imageData - Source image data to dither
     * @param palette - Available colors (RGB format)
     * @param settings - Dithering configuration
     * @returns Dithered image data
     */
    apply(
        imageData: ImageData,
        palette: RGB[],
        settings: DitheringSettings
    ): ImageData;
}

/**
 * Default dithering settings
 */
export const DEFAULT_DITHERING_SETTINGS: DitheringSettings = {
    algorithm: 'none', // Original (no dithering) by default
    strength: 1.0,
    colorSpace: 'rgb', // RGB by default (user can enable LAB if needed)
    serpentine: true // Reduces banding artifacts
};
