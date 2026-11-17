// Re-export shared types from @/lib/tools
import type { DitheringSettings } from '@/lib/image-processing/dithering/types';
export type { DitheringSettings } from '@/lib/image-processing/dithering/types';
export type { MindustryMaterial, PixelGrid, PixelGridCell, SchematicFile } from '@/lib/tools';

// Sorter-specific types
export type BlockType = 'sorter' | 'inverted-sorter' | 'duct-router';

export type GeneratorSettings = {
    blockType: BlockType;
    blockSize: number;
    splitVertical: number;
    splitHorizontal: number;
    dithering: boolean;
    advancedDithering: boolean;
    advancedDitheringSettings: DitheringSettings;
};

export type SchematicData = {
    image: File;
    blockSize: number;
    splitVertical: number;
    splitHorizontal: number;
    selectedMaterials: string[];
};
