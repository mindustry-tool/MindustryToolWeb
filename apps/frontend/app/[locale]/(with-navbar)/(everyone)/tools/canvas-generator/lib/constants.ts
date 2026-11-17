/**
 * Canvas block specifications in Mindustry
 * Similar to DISPLAY_SPECS in logic-display-generator
 * 
 * Physical dimensions:
 * - 1 Canvas block = 2×2 tiles in-game
 * - Internal resolution: 12×12 pixels per canvas block
 * 
 * Tile calculations:
 * - screenX canvas blocks = screenX × 2 tiles wide
 * - screenY canvas blocks = screenY × 2 tiles tall
 * - Example: screenX=64, screenY=64 → 128×128 tiles
 * 
 * Maximum limits:
 * - Max schematic size: 128×128 tiles
 * - Therefore max screenX/screenY: 64 (64 × 2 = 128 tiles)
 */
export const CANVAS_SPEC = {
    width: 12,      // Internal pixels width per canvas block
    height: 12,     // Internal pixels height per canvas block
    blockSize: 2,   // Physical size in game tiles (2x2)
    type: 'canvas' as const,
} as const;

/**
 * Canvas generation limits
 */
export const CANVAS_LIMITS = {
    maxTiles: 128,          // Maximum tiles in either dimension (Mindustry schematic limit)
    maxScreens: 64,         // Maximum screens in either dimension (128 tiles / 2 tiles per block)
    minScreens: 1,          // Minimum screens in either dimension
} as const;
