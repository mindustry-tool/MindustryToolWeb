import type { DitheringSettings } from './types';

/**
 * Available dithering presets
 */
export type DitheringPreset = 'photo-anime' | 'pixel-art' | 'clean' | 'high-quality' | 'custom';

/**
 * Preset configurations for common use cases
 */
export const DITHERING_PRESETS: Record<DitheringPreset, DitheringSettings | null> = {
    'photo-anime': {
        algorithm: 'floyd-steinberg',
        strength: 1.0,
        colorSpace: 'rgb',
        serpentine: true,
    },
    'pixel-art': {
        algorithm: 'ordered',
        strength: 0.5,
        colorSpace: 'rgb',
        serpentine: false,
    },
    'clean': {
        algorithm: 'none',
        strength: 0,
        colorSpace: 'rgb',
        serpentine: false,
    },
    'high-quality': {
        algorithm: 'floyd-steinberg',
        strength: 1.0,
        colorSpace: 'lab',
        serpentine: true,
    },
    'custom': null, // Custom means user-defined settings
};

/**
 * Preset metadata for UI display
 */
export const PRESET_METADATA: Record<DitheringPreset, { label: string; icon: string; description: string }> = {
    'photo-anime': {
        label: 'Photo/Anime',
        icon: '📸',
        description: 'Best for high-detail images, anime artwork, and photographs',
    },
    'pixel-art': {
        label: 'Pixel Art',
        icon: '🎮',
        description: 'Optimized for pixel art, retro graphics, and low-detail images',
    },
    'clean': {
        label: 'Clean/Minimal',
        icon: '✨',
        description: 'No dithering - for simple graphics, solid colors, and logos',
    },
    'high-quality': {
        label: 'High Quality',
        icon: '⭐',
        description: 'Maximum quality with LAB color space for best perceptual accuracy',
    },
    'custom': {
        label: 'Custom',
        icon: '🔧',
        description: 'Custom settings configured by user',
    },
};

/**
 * Apply a preset to get dithering settings
 */
export function getPresetSettings(preset: DitheringPreset): DitheringSettings | null {
    return DITHERING_PRESETS[preset];
}

/**
 * Check if current settings match a preset
 */
export function detectPreset(settings: DitheringSettings): DitheringPreset {
    for (const [preset, presetSettings] of Object.entries(DITHERING_PRESETS)) {
        if (preset === 'custom' || !presetSettings) continue;

        if (
            settings.algorithm === presetSettings.algorithm &&
            settings.strength === presetSettings.strength &&
            settings.colorSpace === presetSettings.colorSpace &&
            settings.serpentine === presetSettings.serpentine
        ) {
            return preset as DitheringPreset;
        }
    }

    return 'custom';
}
