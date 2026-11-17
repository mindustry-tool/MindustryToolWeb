// Re-export shared types from @/lib/tools
export type { SchematicFile, PixelData } from '@/lib/tools';

// Re-export DitheringSettings from image-processing
export type { DitheringSettings } from '@/lib/image-processing/dithering/types';

// Logic Display specific types
export type DisplaySize = '80x80' | '176x176' | '26x26';

export type ProcessorCount = 1 | 4;

import type { DitheringSettings } from '@/lib/image-processing/dithering/types';

export type GeneratorSettings = {
    displaySize: DisplaySize;
    processorCount: ProcessorCount;
    screenX: number;
    screenY: number;
    dithering: DitheringSettings;
    colorOptimization: boolean;
    usePackedColors: boolean;
    compressionLevel: number;
    ignoreBorder: boolean;
    bezelCompensation: boolean;
    screenName: string;
    scalingMode: 'pixelated' | 'smooth';
};

export type SchematicData = {
    image: File;
    settings: GeneratorSettings;
};
