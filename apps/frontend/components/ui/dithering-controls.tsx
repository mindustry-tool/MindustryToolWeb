'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tran } from '@/i18n/tran';
import type { DitheringSettings, DitheringAlgorithm } from '@/lib/image-processing/dithering/index';

interface DitheringControlsProps {
    settings: DitheringSettings;
    onChange: (settings: DitheringSettings) => void;
    className?: string;
}

const ALGORITHM_OPTIONS: { value: DitheringAlgorithm; label: string; description: string }[] = [
    { value: 'ordered', label: 'Ordered (Retro)', description: 'Fast, deterministic pattern' },
    { value: 'none', label: 'No Dithering', description: 'Nearest color only' }
];

/**
 * Reusable dithering controls component
 * Use across Canvas, Logic Display, Sorter, and Map generators
 */
export function DitheringControls({ settings, onChange, className }: DitheringControlsProps) {
    return (
        <div className={className}>
            {/* Algorithm Selector */}
            <div className="space-y-2">
                <Label htmlFor="dithering-algorithm"><Tran text="tools.algorithm" /></Label>
                <Select
                    value={settings.algorithm}
                    onValueChange={(value) => onChange({ ...settings, algorithm: value as DitheringAlgorithm })}
                >
                    <SelectTrigger id="dithering-algorithm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ALGORITHM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col">
                                    <span>{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Strength Slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="dithering-strength"><Tran text="tools.strength" /></Label>
                    <span className="text-sm text-muted-foreground">{Math.round(settings.strength * 100)}%</span>
                </div>
                <Slider
                    id="dithering-strength"
                    value={[settings.strength * 100]}
                    onValueChange={([value]) => onChange({ ...settings, strength: value! / 100 })}
                    min={0}
                    max={100}
                    step={5}
                    disabled={settings.algorithm === 'none'}
                />
            </div>

            {/* Color Space Toggle */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="color-space"><Tran text="tools.lab-color-space" /></Label>
                    <p className="text-xs text-muted-foreground">
                        More accurate color matching (+15% slower)
                    </p>
                </div>
                <Switch
                    id="color-space"
                    checked={settings.colorSpace === 'lab'}
                    onCheckedChange={(checked) =>
                        onChange({ ...settings, colorSpace: checked ? 'lab' : 'rgb' })
                    }
                    disabled={settings.algorithm === 'none'}
                />
            </div>
        </div>
    );
}
