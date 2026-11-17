import type { BlockType, MindustryMaterial } from './types';

/**
 * Canvas block color palette (8 colors)
 * Canvas is a 2x2 block with 12x12 internal pixel display
 * Based on the actual Canvas block supported colors in Mindustry
 */
export const MINDUSTRY_MATERIALS: MindustryMaterial[] = [
    { name: 'canvas-color-1', displayName: 'Dark Purple', color: '#362944', icon: 'canvas-color-1' },
    { name: 'canvas-color-2', displayName: 'Pink', color: '#c45d9f', icon: 'canvas-color-2' },
    { name: 'canvas-color-3', displayName: 'Light Pink', color: '#e39aac', icon: 'canvas-color-3' },
    { name: 'canvas-color-4', displayName: 'Beige', color: '#f0dab1', icon: 'canvas-color-4' },
    { name: 'canvas-color-5', displayName: 'Blue', color: '#5b58b0', icon: 'canvas-color-5' },
    { name: 'canvas-color-6', displayName: 'Teal', color: '#258f99', icon: 'canvas-color-6' },
    { name: 'canvas-color-7', displayName: 'Light Green', color: '#93d4b5', icon: 'canvas-color-7' },
    { name: 'canvas-color-8', displayName: 'Off White', color: '#f0f6e8', icon: 'canvas-color-8' },
];

export const BLOCK_TYPES: { value: BlockType; label: string; imageUrl: string }[] = [
    { value: 'canvas', label: 'Canvas', imageUrl: 'https://image.mindustry-tool.com/media/0199baa2-ab20-70bc-9190-e883844f8c26.png' },
];
