import type { DisplaySize } from './types';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';

/**
 * Logic Display specifications in Mindustry
 */
export const DISPLAY_SPECS = {
    '80x80': {
        width: 80,
        height: 80,
        border: 8,  // Border width in pixels
        size: 96,   // Total block size in pixels (3x3 blocks * 32 pixels per block)
        type: 'logic-display' as const,
        borderImageUrl: 'https://image.mindustry-tool.com/media/019acb5e-78cd-74e8-b2c6-4e95fc6730f7.png'
    },
    '176x176': {
        width: 176,
        height: 176,
        border: 8,  // Border width in pixels
        size: 192,  // Total block size in pixels (6x6 blocks * 32 pixels per block)
        type: 'large-logic-display' as const,
        borderImageUrl: 'https://image.mindustry-tool.com/media/019acb5e-7878-76cd-953d-de417acc9f7d.png'
    },
    '26x26': {
        width: 26,
        height: 26,
        border: 3,  // Border is 3 pixels for tile display
        size: 32,   // Total block size in pixels (1x1 block * 32 pixels per block)
        type: 'tile-logic-display' as const
        // No border image for tiled display
    },
} as const satisfies Record<DisplaySize, {
    width: number;
    height: number;
    border: number;
    size: number;
    type: string;
    borderImageUrl?: string;
}>;

/**
 * Display type options with icons
 */
export const DISPLAY_TYPES = [
    {
        value: '80x80' as DisplaySize,
        label: 'Logic Display',
        imageUrl: 'https://image.mindustry-tool.com/media/0199baa2-ab12-7238-acf0-1f0660166bf7.png',
        description: '80×80 pixels (3×3 blocks)',
        maxTiling: 6
    },
    {
        value: '176x176' as DisplaySize,
        label: 'Large Logic Display',
        imageUrl: 'https://image.mindustry-tool.com/media/0199baa2-ab0b-7165-9a31-462d5383f7c1.png',
        description: '176×176 pixels (6×6 blocks)',
        maxTiling: 4
    },
    {
        value: '26x26' as DisplaySize,
        label: 'Tiled Logic Display',
        imageUrl: 'https://image.mindustry-tool.com/media/0199b9c6-c283-7282-b138-47c3c2086b22.png',
        description: '26×26 pixels (1×1 block)',
        maxTiling: 16
    }
] as const;

/**
 * Micro Processor instruction limit
 */
export const PROCESSOR_INSTRUCTION_LIMIT = 1000;

/**
 * Default generator settings
 */
export const DEFAULT_SETTINGS = {
    displaySize: '80x80' as DisplaySize,
    processorCount: 1 as const,
    screenX: 1,
    screenY: 1,
    colorOptimization: true,
    usePackedColors: false, // Debug: Disable packed colors to rule out issues // Enable by default for better performance
    compressionLevel: 0, // Default compression level (0-7)
    ignoreBorder: false, // Ignore borders by default for better image utilization
    bezelCompensation: false, // Compensate for gaps between screens
    screenName: 'display1', // Default display name in logic code
    dithering: DEFAULT_DITHERING_SETTINGS, // Full dithering settings
    scalingMode: 'smooth' as const, // Default to smooth for better photos
};
