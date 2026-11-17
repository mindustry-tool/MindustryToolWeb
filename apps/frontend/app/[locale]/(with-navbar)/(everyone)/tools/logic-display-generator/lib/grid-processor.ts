/**
 * Grid Processor
 * 
 * Handles splitting images into multiple screens arranged in a grid layout.
 * This is essential for displaying large images across multiple logic displays.
 */

import type { DisplaySize, PixelData } from './types';
import { DISPLAY_SPECS } from './constants';

export type GridSettings = {
    screenX: number;      // Number of screens horizontally
    screenY: number;      // Number of screens vertically
    ignoreBorder: boolean; // Whether to ignore screen borders
    bezelCompensation?: boolean; // Whether to compensate for gaps between screens
};

/**
 * GridProcessor class
 * 
 * Processes images for multi-screen display layouts
 */
export class GridProcessor {
    /**
     * Split image into grid of screens
     * 
     * Note: imageData is expected to be pre-resized to exact target dimensions
     * (dispWidth * screenX) x (dispHeight * screenY)
     * 
     * @param imageData - Canvas ImageData object (already resized to target)
     * @param displaySize - Size of each display
     * @param gridSettings - Grid configuration
     * @returns Array of arrays, each inner array contains pixels for one screen
     */
    public splitImageToGrid(
        imageData: ImageData,
        displaySize: DisplaySize,
        gridSettings: GridSettings
    ): PixelData[][] {
        const { screenX, screenY } = gridSettings;
        const { width: dispWidth, height: dispHeight } = DISPLAY_SPECS[displaySize];

        const screens: PixelData[][] = [];

        // imageData is already pre-resized to exact target size
        // Just extract each screen's pixels directly
        for (let ty = 0; ty < screenY; ty++) {
            for (let tx = 0; tx < screenX; tx++) {
                const screenPixels: PixelData[] = [];

                // Calculate offset for this screen in the pre-resized image
                const offsetX = tx * dispWidth;
                const offsetY = ty * dispHeight;

                // Extract pixels for this screen
                for (let y = 0; y < dispHeight; y++) {
                    for (let x = 0; x < dispWidth; x++) {
                        const srcX = offsetX + x;
                        const srcY = offsetY + y;

                        // Bounds check
                        if (srcX >= imageData.width || srcY >= imageData.height) continue;

                        const idx = (srcY * imageData.width + srcX) * 4;
                        const a = imageData.data[idx + 3] as number;

                        // Only include non-transparent pixels
                        if (a > 2) {
                            screenPixels.push({
                                x,
                                y,
                                r: imageData.data[idx] as number,
                                g: imageData.data[idx + 1] as number,
                                b: imageData.data[idx + 2] as number,
                                a,
                            });
                        }
                    }
                }

                screens.push(screenPixels);
            }
        }

        return screens;
    }

    /**
     * Calculate aspect ratio for cropping based on grid settings
     */
    public calculateAspectRatio(
        displaySize: DisplaySize,
        gridSettings: GridSettings
    ): [number, number] {
        const { screenX, screenY, ignoreBorder } = gridSettings;
        const { width: dispWidth, height: dispHeight, border } = DISPLAY_SPECS[displaySize];

        if (ignoreBorder) {
            const width = dispWidth * screenX - 2 * border;
            const height = dispHeight * screenY - 2 * border;
            return [1, height / width];
        } else {
            return [1, screenY / screenX];
        }
    }

    /**
     * Get total display dimensions for a grid
     */
    public getTotalDimensions(
        displaySize: DisplaySize,
        gridSettings: GridSettings
    ): { width: number; height: number } {
        const { screenX, screenY } = gridSettings;
        const { width, height } = DISPLAY_SPECS[displaySize];

        return {
            width: width * screenX,
            height: height * screenY,
        };
    }

    /**
     * Validate grid settings
     */
    public validateGridSettings(
        gridSettings: GridSettings,
        displaySize: DisplaySize
    ): { valid: boolean; error?: string } {
        const { screenX, screenY } = gridSettings;

        if (screenX < 1 || screenY < 1) {
            return {
                valid: false,
                error: 'Grid must have at least 1 screen in each dimension',
            };
        }

        const maxScreens = displaySize === '80x80' ? 4 : 4;
        if (screenX > maxScreens || screenY > maxScreens) {
            return {
                valid: false,
                error: `Grid cannot exceed ${maxScreens}x${maxScreens} screens`,
            };
        }

        return { valid: true };
    }

    /**
     * Calculate screen index from grid position
     */
    public getScreenIndex(gridX: number, gridY: number, screenX: number): number {
        return gridY * screenX + gridX;
    }

    /**
     * Calculate grid position from screen index
     */
    public getGridPosition(screenIndex: number, screenX: number): [number, number] {
        const x = screenIndex % screenX;
        const y = Math.floor(screenIndex / screenX);
        return [x, y];
    }
}
