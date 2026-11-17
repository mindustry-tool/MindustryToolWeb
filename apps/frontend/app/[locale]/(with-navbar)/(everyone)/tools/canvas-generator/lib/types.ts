// Re-export shared types from @/lib/tools
export type { MindustryMaterial, PixelGrid, PixelGridCell, SchematicFile } from '@/lib/tools';

// Canvas-specific imports
import type { DitheringSettings } from '@/lib/image-processing/dithering/types';
import type { DitheringPreset } from '@/lib/image-processing/dithering/presets';

// Canvas-specific types
export type BlockType = 'canvas';

export interface GeneratorSettings {
    blockType: BlockType;
    dithering: boolean;
    advancedDithering: boolean;
    advancedDitheringSettings: DitheringSettings;
    ditheringPreset?: DitheringPreset;
    screenX: number;
    screenY: number;
}

export type SchematicData = {
    image: File;
    selectedMaterials: string[];
};
