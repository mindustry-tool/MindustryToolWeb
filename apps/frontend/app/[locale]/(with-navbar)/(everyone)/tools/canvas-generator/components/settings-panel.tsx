'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { BLOCK_TYPES } from '../lib/materials';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';
import type { BlockType, GeneratorSettings } from '../lib/types';

type SettingsPanelProps = {
    settings: GeneratorSettings;
    onSettingsChange: (settings: GeneratorSettings) => void;
    imageWidth?: number;
    imageHeight?: number;
    showOutputInfo?: boolean;
    imageFile?: File | null;
    onReset?: () => void; // Optional callback when reset is clicked
};

const DEFAULT_SETTINGS: GeneratorSettings = {
    blockType: 'canvas',
    dithering: false,
    advancedDithering: false,
    advancedDitheringSettings: DEFAULT_DITHERING_SETTINGS,
    screenX: 1,
    screenY: 1,
};

export function SettingsPanel({ settings, onSettingsChange, className, onReset }: SettingsPanelProps & { className?: string }) {
    const { t } = useI18n('generator-canvas');
    const updateSettings = (updates: Partial<GeneratorSettings>) => {

        onSettingsChange({ ...settings, ...updates });
    };

    const handleReset = () => {
        onSettingsChange(DEFAULT_SETTINGS);
        onReset?.(); // Call optional reset callback
    };

    return (
        <div className={cn("space-y-6 rounded-lg border p-6", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold"><Tran text="generator-canvas.settings" /></h3>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    <Tran text="tools.reset" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="block-type"><Tran text="tools.block" /></Label>
                        <Select
                            value={settings.blockType}
                            onValueChange={(value: BlockType) => updateSettings({ blockType: value })}
                        >
                            <SelectTrigger id="block-type" className="w-full">
                                <SelectValue placeholder={t('generator-canvas.select-block-type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {BLOCK_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-5 w-5 shrink-0">
                                                <Image
                                                    src={type.imageUrl}
                                                    alt={type.label}
                                                    fill
                                                    className="object-contain"
                                                    sizes="20px"
                                                />
                                            </div>
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Screen Size (Tiling) */}
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="screen-x">
                                <Tran text="generator-canvas.screen-x" />
                            </Label>
                            <span className="text-sm text-muted-foreground">{settings.screenX}</span>
                        </div>
                        <Slider
                            value={[settings.screenX]}
                            onValueChange={([value]: number[]) => updateSettings({ screenX: value })}
                            min={1}
                            max={64}
                            step={1}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="screen-y">
                                <Tran text="generator-canvas.screen-y" />
                            </Label>
                            <span className="text-sm text-muted-foreground">{settings.screenY}</span>
                        </div>
                        <Slider
                            value={[settings.screenY]}
                            onValueChange={([value]: number[]) => updateSettings({ screenY: value })}
                            min={1}
                            max={64}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
