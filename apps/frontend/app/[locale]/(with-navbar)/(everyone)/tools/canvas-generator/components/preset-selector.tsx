import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { Sparkles } from 'lucide-react';
import { PRESET_METADATA, getPresetSettings, type DitheringPreset } from '@/lib/image-processing/dithering/presets';
import type { GeneratorSettings } from '../lib/types';

type PresetSelectorProps = {
    settings: GeneratorSettings;
    onSettingsChange: (settings: GeneratorSettings) => void;
};

export function PresetSelector({ settings, onSettingsChange }: PresetSelectorProps) {
    const applyPreset = (preset: DitheringPreset) => {
        const presetSettings = getPresetSettings(preset);
        if (presetSettings) {
            onSettingsChange({
                ...settings,
                advancedDithering: true,
                advancedDitheringSettings: presetSettings,
                ditheringPreset: preset,
            });
        }
    };

    const currentPreset = settings.ditheringPreset || 'custom';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <Tran text="generator-canvas.advanced-settings" />
                    <span className="ml-2 text-xs text-muted-foreground">
                        ({PRESET_METADATA[currentPreset].label})
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <Tran text="generator-canvas.advanced-settings" />
                    </DialogTitle>
                    <DialogDescription>
                        <Tran
                            text="generator-canvas.preset-description"
                        />
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-4">
                    {(Object.keys(PRESET_METADATA) as DitheringPreset[])
                        .filter((preset) => preset !== 'custom')
                        .map((preset) => {
                            const meta = PRESET_METADATA[preset];
                            const isSelected = currentPreset === preset;
                            const presetSettings = getPresetSettings(preset);

                            return (
                                <div
                                    key={preset}
                                    className={`flex flex-col space-y-2 rounded-md border p-4 cursor-pointer transition-colors ${isSelected
                                            ? 'bg-accent border-accent-foreground/20 hover:bg-accent/80'
                                            : 'hover:bg-muted/50'
                                        }`}
                                    onClick={() => applyPreset(preset)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{meta.icon}</span>
                                            <div>
                                                <div className="font-medium">{meta.label}</div>
                                                <div className="text-xs text-muted-foreground">{meta.description}</div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                                <span>✓</span>
                                                <Tran text="generator-canvas.active" />
                                            </div>
                                        )}
                                    </div>

                                    {presetSettings && (
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <span className="px-2 py-0.5 rounded-full bg-muted">
                                                {presetSettings.algorithm}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-muted">
                                                {Math.round(presetSettings.strength * 100)}% strength
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-muted">
                                                {presetSettings.colorSpace.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
