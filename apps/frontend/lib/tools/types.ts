import type { DitheringSettings } from '@/lib/image-processing/dithering/types';
import type { DitheringPreset } from '@/lib/image-processing/dithering/presets';

// ============================================
// Common Types for All Generator Tools
// ============================================

/**
 * Represents a Mindustry material/item with display info
 */
export type MindustryMaterial = {
    name: string;
    displayName: string;
    color: string;
    icon: string;
    imageUrl?: string;
};

/**
 * A cell in the pixel grid representing a placed block
 */
export type PixelGridCell = {
    material: string;
    x: number;
    y: number;
};

/**
 * 2D grid of pixels, where each cell can be a block or null
 */
export type PixelGrid = (PixelGridCell | null)[][];

/**
 * Represents a generated schematic file
 */
export type SchematicFile = {
    blob: Blob;
    filename: string;
};

// ============================================
// Base Settings Interface
// ============================================

/**
 * Common settings shared across generators
 */
export interface BaseGeneratorSettings {
    dithering: boolean;
    screenX?: number;
    screenY?: number;
}

// ============================================
// Canvas Generator Types
// ============================================

export type CanvasBlockType = 'canvas';

export interface CanvasGeneratorSettings extends BaseGeneratorSettings {
    blockType: CanvasBlockType;
    advancedDithering: boolean;
    advancedDitheringSettings: DitheringSettings;
    ditheringPreset?: DitheringPreset;
    screenX: number;
    screenY: number;
}

// ============================================
// Sorter Generator Types
// ============================================

export type SorterBlockType = 'sorter' | 'inverted-sorter' | 'duct-router';

export interface SorterGeneratorSettings extends BaseGeneratorSettings {
    blockType: SorterBlockType;
    blockSize: number;
    splitVertical: number;
    splitHorizontal: number;
}

// ============================================
// Logic Display Generator Types
// ============================================

export type DisplaySize = '80x80' | '176x176' | '26x26';
export type ProcessorCount = 1 | 4;

export interface LogicDisplayGeneratorSettings extends BaseGeneratorSettings {
    displaySize: DisplaySize;
    processorCount: ProcessorCount;
    screenX: number;
    screenY: number;
    colorOptimization: boolean;
    usePackedColors: boolean;
    compressionLevel: number;
    ignoreBorder: boolean;
    bezelCompensation: boolean;
    screenName: string;
    scalingMode: 'pixelated' | 'smooth';
}

// ============================================
// Pixel Data (for Logic Display)
// ============================================

export type PixelData = {
    r: number;
    g: number;
    b: number;
    a: number;
    x: number;
    y: number;
};
