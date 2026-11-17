import type { RGB } from './dithering/types';

/**
 * Convert hex color to RGB array
 */
export function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || !result[1] || !result[2] || !result[3]) {
        return [0, 0, 0];
    }
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
export function colorDistance(rgb1: RGB, rgb2: RGB): number {
    const rDiff = rgb1[0] - rgb2[0];
    const gDiff = rgb1[1] - rgb2[1];
    const bDiff = rgb1[2] - rgb2[2];
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Calculate Weighted Euclidean distance (Redmean) between two RGB colors
 * This is perceptually more accurate than simple Euclidean distance
 * https://en.wikipedia.org/wiki/Color_difference
 */
export function weightedColorDistance(rgb1: RGB, rgb2: RGB): number {
    const r1 = rgb1[0];
    const r2 = rgb2[0];
    const rDiff = r1 - r2;
    const gDiff = rgb1[1] - rgb2[1];
    const bDiff = rgb1[2] - rgb2[2];

    // Redmean formula
    const rMean = (r1 + r2) / 2;

    return Math.sqrt(
        (2 + rMean / 256) * rDiff * rDiff +
        4 * gDiff * gDiff +
        (2 + (255 - rMean) / 256) * bDiff * bDiff
    );
}
