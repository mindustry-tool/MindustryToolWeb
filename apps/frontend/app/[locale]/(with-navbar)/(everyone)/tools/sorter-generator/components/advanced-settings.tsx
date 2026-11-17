import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { Settings } from 'lucide-react';
import type { GeneratorSettings } from '../lib/types';
import type { MindustryMaterial } from '@/lib/tools';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';

type AdvancedSettingsProps = {
    settings: GeneratorSettings;
    onSettingsChange: (settings: GeneratorSettings) => void;
    materials: MindustryMaterial[];
    selectedMaterials: string[];
    onMaterialsChange: (selected: string[]) => void;
};

export function AdvancedSettings({
    settings,
    onSettingsChange,
    materials,
    selectedMaterials,
    onMaterialsChange
}: AdvancedSettingsProps) {
    const { t } = useI18n('tags');

    // Fallback for advancedDitheringSettings if undefined
    const ditheringSettings = settings.advancedDitheringSettings || DEFAULT_DITHERING_SETTINGS;

    const updateSettings = (updates: Partial<GeneratorSettings>) => {
        onSettingsChange({ ...settings, ...updates });
    };

    const toggleAll = (select: boolean) => {
        onMaterialsChange(select ? materials.map((m) => m.name) : []);
    };

    const toggleMaterial = (materialName: string) => {
        if (selectedMaterials.includes(materialName)) {
            onMaterialsChange(selectedMaterials.filter((m) => m !== materialName));
        } else {
            onMaterialsChange([...selectedMaterials, materialName]);
        }
    };

    const allSelected = selectedMaterials.length === materials.length;
    const noneSelected = selectedMaterials.length === 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <Tran text="generator-sorter.advanced-settings" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <Tran text="generator-sorter.advanced-settings" />
                    </DialogTitle>
                    <DialogDescription>
                        <Tran
                            text="generator-sorter.advanced-settings-desc"
                        />
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Dithering Section */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">
                            <Tran text="generator-sorter.dithering" />
                        </Label>

                        {/* Algorithm Selector */}
                        <div className="space-y-2">
                            <Label htmlFor="dither-algorithm"><Tran text="generator-sorter.algorithm" /></Label>
                            <Select
                                value={ditheringSettings.algorithm}
                                onValueChange={(value: any) => updateSettings({
                                    advancedDithering: true,
                                    dithering: true,
                                    advancedDitheringSettings: {
                                        ...ditheringSettings,
                                        algorithm: value
                                    }
                                })}
                            >
                                <SelectTrigger id="dither-algorithm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Original (No Filter)</SelectItem>
                                    <SelectItem value="floyd-steinberg">Floyd-Steinberg</SelectItem>
                                    <SelectItem value="ordered">Ordered (Retro)</SelectItem>
                                    <SelectItem value="atkinson">Atkinson (Bright)</SelectItem>
                                    <SelectItem value="stucki">Stucki (Smooth)</SelectItem>
                                    <SelectItem value="sierra">Sierra</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Strength Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dither-strength"><Tran text="strength" /></Label>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round(ditheringSettings.strength * 100)}%
                                </span>
                            </div>
                            <Slider
                                id="dither-strength"
                                value={[ditheringSettings.strength * 100]}
                                onValueChange={([value]: number[]) => updateSettings({
                                    advancedDithering: true,
                                    dithering: true,
                                    advancedDitheringSettings: {
                                        ...ditheringSettings,
                                        strength: value! / 100
                                    }
                                })}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                            />
                        </div>

                        {/* LAB Color Space Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="lab-color">LAB Color Space</Label>
                                <p className="text-xs text-muted-foreground">More accurate (+15% slower)</p>
                            </div>
                            <Switch
                                id="lab-color"
                                checked={ditheringSettings.colorSpace === 'lab'}
                                onCheckedChange={(checked: boolean) => updateSettings({
                                    advancedDithering: true,
                                    dithering: true,
                                    advancedDitheringSettings: {
                                        ...ditheringSettings,
                                        colorSpace: checked ? 'lab' : 'rgb'
                                    }
                                })}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Materials Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                                <Tran text="generator-sorter.materials" />
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {selectedMaterials.length}/{materials.length} selected
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAll(true)}
                                disabled={allSelected}
                                className="flex-1"
                            >
                                <Tran text="generator-sorter.select-all" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAll(false)}
                                disabled={noneSelected}
                                className="flex-1"
                            >
                                <Tran text="generator-sorter.deselect-all" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-50 overflow-y-auto p-1">
                            {materials.map((material) => {
                                const isSelected = selectedMaterials.includes(material.name);
                                const displayName = t(`item-${material.name}`, { defaultValue: material.displayName });

                                return (
                                    <div
                                        key={material.name}
                                        className={`flex items-center space-x-2 rounded-md border p-2 cursor-pointer transition-colors ${isSelected
                                            ? 'bg-accent border-accent-foreground/20 hover:bg-accent/80'
                                            : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => toggleMaterial(material.name)}
                                    >
                                        <div
                                            className="h-5 w-5 rounded-sm border shrink-0"
                                            style={{ backgroundColor: material.color }}
                                        />
                                        <label className="text-xs cursor-pointer flex-1 truncate">{displayName}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
