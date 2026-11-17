/**
 * Shared TypeScript types for Mindustry schematic generation
 */

/**
 * Schematic metadata tags
 */
export type SchematicTags = Record<string, string>;

/**
 * Block position in schematic
 */
export interface BlockPosition {
    x: number;
    y: number;
}

/**
 * Pixel grid type used by canvas and sorter generators
 */
export type PixelGrid = Array<Array<{ x: number; y: number; material: string } | null>>;
