// Export types
export type {
    RGB,
    LAB,
    DitheringAlgorithm,
    ColorSpace,
    DitheringSettings,
    DitheringEngine
} from './types';

// Export const separately
export { DEFAULT_DITHERING_SETTINGS } from './types';

// Re-export color space utilities
export {
    rgbToLab,
    labToRgb,
    colorDistanceRGB,
    colorDistanceLAB,
    colorDistance,
    findClosestColor
} from './color-space';

// Re-export main engine API
export {
    DitheringEngineFactory,
    applyDithering,
    hexToRgb
} from './engine';

// Re-export individual algorithms (for advanced usage)
export { OrderedDithering } from './algorithms/ordered';
export { NoDithering } from './algorithms/none';
