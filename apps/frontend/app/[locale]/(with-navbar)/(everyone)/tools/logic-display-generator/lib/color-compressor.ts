/**
 * Color Compressor
 * 
 * Reduces color depth to minimize the number of unique colors,
 * which helps reduce the number of draw instructions in Mindustry Logic.
 * 
 * Compression levels:
 * - Level 0: 256 values per channel
 * - Level 1: 128 values per channel
 * - Level 2: 64 values per channel
 * - Level 3: 32 values per channel
 * - Level 4: 16 values per channel
 * - Level 5: 8 values per channel
 * - Level 6: 4 values per channel
 * - Level 7: 2 values per channel
 */

import type { PixelData } from './types';

export type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Compression statistics
 */
export type CompressionStats = {
    originalColors: number;
    compressedColors: number;
    compressionRatio: number;
    level: CompressionLevel;
};

/**
 * ColorCompressor class
 * 
 * Provides color compression functionality to reduce the number
 * of unique colors in pixel data.
 */
export class ColorCompressor {
    /**
     * Compress pixel data colors
     * 
     * Algorithm:
     * - k = 2^level
     * - For each color channel: value = round(value / k) * k
     * - This quantizes colors to k distinct levels
     * 
     * @param pixelData - Array of pixel data to compress
     * @param level - Compression level (0-7)
     * @returns Compressed pixel data
     */
    public compress(pixelData: PixelData[], level: CompressionLevel): PixelData[] {
        if (level === 0) {
            return pixelData; // No compression
        }

        const k = Math.pow(2, level);

        return pixelData.map(pixel => ({
            ...pixel,
            r: Math.round(pixel.r / k) * k,
            g: Math.round(pixel.g / k) * k,
            b: Math.round(pixel.b / k) * k,
            // Alpha channel is typically kept at full precision
            // or we could compress it too if needed
        }));
    }

    /**
     * Compress ImageData from canvas
     * 
     * This method operates directly on ImageData for canvas processing
     * 
     * @param imageData - Canvas ImageData object
     * @param level - Compression level (0-7)
     */
    public compressImageData(imageData: ImageData, level: CompressionLevel): void {
        if (level === 0) {
            return; // No compression
        }

        const k = Math.pow(2, level);
        const data = imageData.data;
        const length = imageData.width * imageData.height;

        for (let i = 0; i < length; i++) {
            const index = i * 4;
            // Compress RGB channels (skip alpha at index + 3)
            data[index] = Math.round(data[index]! / k) * k;         // R
            data[index + 1] = Math.round(data[index + 1]! / k) * k; // G
            data[index + 2] = Math.round(data[index + 2]! / k) * k; // B
        }
    }

    /**
     * Apply Floyd-Steinberg dithering to ImageData
     * 
     * @param imageData - Canvas ImageData object
     * @param level - Compression level (0-7)
     */
    public ditherImageData(imageData: ImageData, level: CompressionLevel): void {
        if (level === 0) return;

        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const k = Math.pow(2, level);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Get original values
                const oldR = data[idx]!;
                const oldG = data[idx + 1]!;
                const oldB = data[idx + 2]!;

                // Quantize
                const newR = Math.round(oldR / k) * k;
                const newG = Math.round(oldG / k) * k;
                const newB = Math.round(oldB / k) * k;

                // Set new values
                data[idx] = newR;
                data[idx + 1] = newG;
                data[idx + 2] = newB;

                // Calculate error
                const errR = oldR - newR;
                const errG = oldG - newG;
                const errB = oldB - newB;

                // Distribute error to neighbors
                // Right (7/16)
                if (x + 1 < width) {
                    const nid = (y * width + (x + 1)) * 4;
                    data[nid] = Math.min(255, Math.max(0, data[nid]! + errR * 7 / 16));
                    data[nid + 1] = Math.min(255, Math.max(0, data[nid + 1]! + errG * 7 / 16));
                    data[nid + 2] = Math.min(255, Math.max(0, data[nid + 2]! + errB * 7 / 16));
                }

                // Bottom Left (3/16)
                if (x - 1 >= 0 && y + 1 < height) {
                    const nid = ((y + 1) * width + (x - 1)) * 4;
                    data[nid] = Math.min(255, Math.max(0, data[nid]! + errR * 3 / 16));
                    data[nid + 1] = Math.min(255, Math.max(0, data[nid + 1]! + errG * 3 / 16));
                    data[nid + 2] = Math.min(255, Math.max(0, data[nid + 2]! + errB * 3 / 16));
                }

                // Bottom (5/16)
                if (y + 1 < height) {
                    const nid = ((y + 1) * width + x) * 4;
                    data[nid] = Math.min(255, Math.max(0, data[nid]! + errR * 5 / 16));
                    data[nid + 1] = Math.min(255, Math.max(0, data[nid + 1]! + errG * 5 / 16));
                    data[nid + 2] = Math.min(255, Math.max(0, data[nid + 2]! + errB * 5 / 16));
                }

                // Bottom Right (1/16)
                if (x + 1 < width && y + 1 < height) {
                    const nid = ((y + 1) * width + (x + 1)) * 4;
                    data[nid] = Math.min(255, Math.max(0, data[nid]! + errR * 1 / 16));
                    data[nid + 1] = Math.min(255, Math.max(0, data[nid + 1]! + errG * 1 / 16));
                    data[nid + 2] = Math.min(255, Math.max(0, data[nid + 2]! + errB * 1 / 16));
                }
            }
        }
    }

    /**
     * Get compression statistics
     * 
     * Calculates how many unique colors exist before and after compression
     * 
     * @param pixelData - Original pixel data
     * @param level - Compression level
     * @returns Compression statistics
     */
    public getStatistics(pixelData: PixelData[], level: CompressionLevel): CompressionStats {
        // Count original unique colors
        const originalColors = this.countUniqueColors(pixelData);

        // Compress and count new unique colors
        const compressed = this.compress(pixelData, level);
        const compressedColors = this.countUniqueColors(compressed);

        return {
            originalColors,
            compressedColors,
            compressionRatio: originalColors / compressedColors,
            level,
        };
    }

    /**
     * Count unique colors in pixel data
     * 
     * @param pixelData - Array of pixel data
     * @returns Number of unique colors
     */
    private countUniqueColors(pixelData: PixelData[]): number {
        const colorSet = new Set<string>();

        for (const pixel of pixelData) {
            // Skip fully transparent pixels
            if (pixel.a === 0) {
                continue;
            }

            const colorKey = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
            colorSet.add(colorKey);
        }

        return colorSet.size;
    }

    /**
     * Get recommended compression level based on image characteristics
     * 
     * @param pixelData - Pixel data to analyze
     * @param targetColors - Target maximum number of colors (optional)
     * @returns Recommended compression level
     */
    public getRecommendedLevel(
        pixelData: PixelData[],
        targetColors: number = 64
    ): CompressionLevel {
        const uniqueColors = this.countUniqueColors(pixelData);

        // If already below target, no compression needed
        if (uniqueColors <= targetColors) {
            return 0;
        }

        // Try each level and find the minimum that meets target
        for (let level = 1; level <= 7; level++) {
            const stats = this.getStatistics(pixelData, level as CompressionLevel);
            if (stats.compressedColors <= targetColors) {
                return level as CompressionLevel;
            }
        }

        // If even level 7 doesn't meet target, return max compression
        return 7;
    }

    /**
     * Preview compression effect
     * 
     * Shows how many colors would remain at each compression level
     * 
     * @param pixelData - Pixel data to analyze
     * @returns Array of color counts for each level
     */
    public previewLevels(pixelData: PixelData[]): Array<{
        level: CompressionLevel;
        colors: number;
    }> {
        const results: Array<{ level: CompressionLevel; colors: number }> = [];

        for (let level = 0; level <= 7; level++) {
            const compressed = this.compress(pixelData, level as CompressionLevel);
            const colors = this.countUniqueColors(compressed);
            results.push({ level: level as CompressionLevel, colors });
        }

        return results;
    }

    /**
     * Calculate compression efficiency
     * 
     * Higher efficiency means better compression with fewer unique colors
     * 
     * @param stats - Compression statistics
     * @returns Efficiency percentage (0-100)
     */
    public calculateEfficiency(stats: CompressionStats): number {
        if (stats.originalColors === 0) {
            return 0;
        }

        const reduction = stats.originalColors - stats.compressedColors;
        return (reduction / stats.originalColors) * 100;
    }
}

/**
 * Helper function to apply compression to pixel data
 * 
 * @param pixelData - Pixel data array
 * @param level - Compression level (0-7)
 * @returns Compressed pixel data
 */
export function compressColors(
    pixelData: PixelData[],
    level: CompressionLevel
): PixelData[] {
    const compressor = new ColorCompressor();
    return compressor.compress(pixelData, level);
}

/**
 * Helper function to get compression statistics
 * 
 * @param pixelData - Pixel data array
 * @param level - Compression level (0-7)
 * @returns Compression statistics
 */
export function getCompressionStats(
    pixelData: PixelData[],
    level: CompressionLevel
): CompressionStats {
    const compressor = new ColorCompressor();
    return compressor.getStatistics(pixelData, level);
}
