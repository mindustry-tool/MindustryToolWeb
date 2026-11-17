/**
 * Rectangle Merger
 * 
 * Algorithm to merge adjacent pixels of the same color
 * into larger rectangular blocks, significantly reducing the number of draw
 * instructions needed in Mindustry Logic.
 * 
 * Algorithm:
 * 1. Iterate through all pixels
 * 2. For each unprocessed pixel, find the largest rectangle of same color
 * 3. Use greedy approach to maximize area
 * 4. Mark processed pixels to avoid duplication
 */

import type { PixelData } from './types';

export type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ColorBlock = {
    color: RGBA;
    rect: Rect;
};

/**
 * Image data structure for processing
 */
type ImageData2D = {
    width: number;
    height: number;
    data: Uint8ClampedArray;
};

/**
 * RectangleMerger class
 * 
 * Converts pixel data into optimized color blocks by merging
 * adjacent pixels of the same color into rectangles.
 */
export class RectangleMerger {
    /**
     * Convert pixel data array to color blocks
     * 
     * @param pixelData - Array of pixel data
     * @param imageWidth - Width of the image
     * @param imageHeight - Height of the image
     * @returns Array of color blocks
     */
    public pixelsToColorBlocks(
        pixelData: PixelData[],
        imageWidth: number,
        imageHeight: number
    ): ColorBlock[] {
        // Convert pixel array to ImageData format for processing
        const imageData = this.pixelArrayToImageData(pixelData, imageWidth, imageHeight);

        // Find all color blocks
        const colorBlocks = this.getColorBlocks(imageData);

        return colorBlocks;
    }

    /**
     * Convert PixelData array to ImageData2D structure
     */
    private pixelArrayToImageData(
        pixels: PixelData[],
        width: number,
        height: number
    ): ImageData2D {
        const data = new Uint8ClampedArray(width * height * 4);

        for (const pixel of pixels) {
            const index = (pixel.y * width + pixel.x) * 4;
            data[index] = pixel.r;
            data[index + 1] = pixel.g;
            data[index + 2] = pixel.b;
            data[index + 3] = pixel.a;
        }

        return { width, height, data };
    }

    /**
     * Get color blocks from image data
     * 
     * This is the main algorithm that processes the entire image
     * and finds all color blocks.
     */
    private getColorBlocks(imageData: ImageData2D): ColorBlock[] {
        const statusMap: boolean[] = [];
        const colorBlocks: ColorBlock[] = [];
        const { width, height } = imageData;
        const length = width * height;

        // Initialize status map - true means unprocessed
        for (let i = 0; i < length; i++) {
            statusMap.push(true);
        }

        // Iterate through all pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;

                // Only process unprocessed pixels
                if (statusMap[index]) {
                    const block = this.getMaxSizeBlock(imageData, x, y, statusMap);

                    // Only add non-transparent blocks
                    if (block !== null) {
                        colorBlocks.push(block);
                    }
                }
            }
        }

        return colorBlocks;
    }

    /**
     * Get pixel color at specific coordinates
     */
    private getPixel(image: ImageData2D, x: number, y: number): RGBA {
        const index = (image.width * y + x) * 4;
        return {
            r: image.data[index]!,
            g: image.data[index + 1]!,
            b: image.data[index + 2]!,
            a: image.data[index + 3]!,
        };
    }

    /**
     * Find the maximum size block starting from (x, y)
     * 
     * Algorithm:
     * 1. Start from current pixel
     * 2. Expand downward line by line
     * 3. For each line, find maximum width with same color
     * 4. Track the area and keep the largest rectangle
     * 5. Mark all pixels in the rectangle as processed
     * 
     * @param image - Image data
     * @param x - Starting x coordinate
     * @param y - Starting y coordinate
     * @param statusMap - Map tracking processed pixels
     * @returns ColorBlock or null if transparent
     */
    private getMaxSizeBlock(
        image: ImageData2D,
        x: number,
        y: number,
        statusMap: boolean[]
    ): ColorBlock | null {
        const originColor = this.getPixel(image, x, y);

        // Skip transparent pixels
        if (originColor.a === 0) {
            const index = y * image.width + x;
            statusMap[index] = false;
            return null;
        }

        let maxX = -1;
        let maxY = 0;
        const maxSize = {
            area: 0,
            x: 0,
            y: 0,
        };

        // Expand downward
        while (true) {
            // Check if we can expand more rows
            if (y + maxY >= image.height) {
                break;
            }

            // Check first pixel of new row
            const color = this.getPixel(image, x, y + maxY);
            if (!this.isSameColor(originColor, color)) {
                break;
            }

            // Find maximum width for this row
            let mx = 1;
            while (true) {
                if (x + mx >= image.width) {
                    break;
                }

                const color = this.getPixel(image, x + mx, y + maxY);
                if (this.isSameColor(originColor, color)) {
                    mx++;
                } else {
                    break;
                }
            }

            maxY++;

            // Update max width constraint
            if (maxX === -1 || mx < maxX) {
                maxX = mx;
            }

            // Calculate area and update if larger
            const area = maxY * maxX;
            if (area > maxSize.area) {
                maxSize.area = area;
                maxSize.x = maxX;
                maxSize.y = maxY;
            }
        }

        const finalMaxX = maxSize.x;
        const finalMaxY = maxSize.y;

        // Mark all pixels in the rectangle as processed
        for (let sy = 0; sy < finalMaxY; sy++) {
            const ty = y + sy;
            for (let sx = 0; sx < finalMaxX; sx++) {
                const tx = x + sx;
                const index = ty * image.width + tx;
                statusMap[index] = false;
            }
        }

        // Return color block
        // Note: In Mindustry, y-axis is flipped (origin at bottom-left)
        return {
            color: originColor,
            rect: {
                x: x,
                y: image.height - y - finalMaxY, // Flip y-coordinate
                width: finalMaxX,
                height: finalMaxY,
            },
        };
    }

    /**
     * Check if two colors are the same
     */
    private isSameColor(color1: RGBA, color2: RGBA): boolean {
        return (
            color1.r === color2.r &&
            color1.g === color2.g &&
            color1.b === color2.b &&
            color1.a === color2.a
        );
    }

    /**
     * Group color blocks by color
     * 
     * This groups blocks of the same color together, which is useful
     * for generating optimized mlog code (set color once, draw multiple rects).
     * 
     * @param colorBlocks - Array of color blocks
     * @returns Map of color string to blocks with that color
     */
    public groupByColor(colorBlocks: ColorBlock[]): Map<string, ColorBlock[]> {
        const map = new Map<string, ColorBlock[]>();

        for (const block of colorBlocks) {
            const { color } = block;
            const colorKey = `${color.r},${color.g},${color.b},${color.a}`;

            if (!map.has(colorKey)) {
                map.set(colorKey, []);
            }

            map.get(colorKey)!.push(block);
        }

        return map;
    }

    /**
     * Calculate statistics about the color blocks
     * 
     * @param colorBlocks - Array of color blocks
     * @returns Statistics object
     */
    public getStatistics(colorBlocks: ColorBlock[]): {
        totalBlocks: number;
        uniqueColors: number;
        averageBlockSize: number;
        largestBlock: number;
    } {
        const colorMap = this.groupByColor(colorBlocks);

        let totalArea = 0;
        let largestBlock = 0;

        for (const block of colorBlocks) {
            const area = block.rect.width * block.rect.height;
            totalArea += area;
            if (area > largestBlock) {
                largestBlock = area;
            }
        }

        return {
            totalBlocks: colorBlocks.length,
            uniqueColors: colorMap.size,
            averageBlockSize: totalArea / colorBlocks.length,
            largestBlock,
        };
    }
}
