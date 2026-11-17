'use client';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_DITHERING_SETTINGS } from '@/lib/image-processing/dithering/types';
import Image from 'next/image';
import { BLOCK_TYPES } from '../lib/materials';
import type { BlockType, GeneratorSettings } from '../lib/types';

type SettingsPanelProps = {
    settings: GeneratorSettings;
    onSettingsChange: (settings: GeneratorSettings) => void;
    imageWidth?: number;
    imageHeight?: number;
    showOutputInfo?: boolean;
    imageFile?: File | null;
};

const DEFAULT_SETTINGS: GeneratorSettings = {
    blockType: 'sorter',
    blockSize: 5,
    splitVertical: 1,
    splitHorizontal: 1,
    dithering: false,
    advancedDithering: false,
    advancedDitheringSettings: DEFAULT_DITHERING_SETTINGS,
};

export function SettingsPanel({ settings, onSettingsChange, imageWidth, imageHeight, showOutputInfo, imageFile, className }: SettingsPanelProps & { className?: string }) {
    const { t } = useI18n('generator-sorter');
    const updateSettings = (updates: Partial<GeneratorSettings>) => {
        onSettingsChange({ ...settings, ...updates });
    };

    const handleReset = () => {
        onSettingsChange(DEFAULT_SETTINGS);
    };

    const outputWidth = imageWidth ? Math.ceil(imageWidth / settings.blockSize) : 0;
    const outputHeight = imageHeight ? Math.ceil(imageHeight / settings.blockSize) : 0;
    const totalBlocks = outputWidth * outputHeight;
    const fileCount = settings.splitHorizontal > 1 || settings.splitVertical > 1
        ? settings.splitHorizontal * settings.splitVertical
        : 1;

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={cn("space-y-6 rounded-lg border p-6", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold"><Tran text="generator-sorter.settings" /></h3>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    <Tran text="generator-sorter.reset" />
                </Button>
            </div>

            <div className="space-y-4">
                {/* Block Type and Block Size - Same Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="block-type"><Tran text="generator-sorter.block" /></Label>
                        <Select
                            value={settings.blockType}
                            onValueChange={(value: BlockType) => updateSettings({ blockType: value })}
                        >
                            <SelectTrigger id="block-type" className="w-full">
                                <SelectValue placeholder={t('generator-sorter.select-block-type')} />
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

                    <div className="space-y-2">
                        <Label htmlFor="block-size"><Tran text="generator-sorter.block-size" /></Label>
                        <Input
                            id="block-size"
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            defaultValue={settings.blockSize}
                            key={settings.blockSize}
                            onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 1 && value <= 100) {
                                    updateSettings({ blockSize: value });
                                } else {
                                    // Reset to current value if invalid
                                    e.target.value = settings.blockSize.toString();
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Vertical Split */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label><Tran text="generator-sorter.split-vertical" /></Label>
                        <span className="text-sm text-muted-foreground">{settings.splitVertical}</span>
                    </div>
                    <Slider
                        value={[settings.splitVertical]}
                        onValueChange={([value]) => updateSettings({ splitVertical: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Horizontal Split */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label><Tran text="generator-sorter.split-horizontal" /></Label>
                        <span className="text-sm text-muted-foreground">{settings.splitHorizontal}</span>
                    </div>
                    <Slider
                        value={[settings.splitHorizontal]}
                        onValueChange={([value]) => updateSettings({ splitHorizontal: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Output Info */}
                {showOutputInfo && (
                    <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                        <h4 className="text-xs font-semibold text-muted-foreground"><Tran text="generator-sorter.output-info" /></h4>

                        {/* Original Image Info */}
                        {imageFile && imageWidth && imageHeight && (
                            <div className="pb-2 border-b border-border/50">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground"><Tran text="generator-sorter.original-size" />:</span>
                                        <span className="ml-2 font-mono">{imageWidth} × {imageHeight}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground"><Tran text="generator-sorter.file-size" />:</span>
                                        <span className="ml-2 font-mono">{formatFileSize(imageFile.size)}</span>
                                        <span className="ml-1.5 inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                                            {imageFile.name.split('.').pop()?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schematic Output Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-muted-foreground"><Tran text="generator-sorter.width" />:</span>
                                <span className="ml-2 font-mono">{outputWidth} <Tran text="generator-sorter.blocks" /></span>
                            </div>
                            <div>
                                <span className="text-muted-foreground"><Tran text="generator-sorter.height" />:</span>
                                <span className="ml-2 font-mono">{outputHeight} <Tran text="generator-sorter.blocks" /></span>
                            </div>
                            <div>
                                <span className="text-muted-foreground"><Tran text="generator-sorter.total-blocks" />:</span>
                                <span className="ml-2 font-mono">{totalBlocks}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground"><Tran text="generator-sorter.files" />:</span>
                                <span className="ml-2 font-mono">{fileCount}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
