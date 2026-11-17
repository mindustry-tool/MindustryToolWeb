'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tran } from '@/i18n/tran';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { DitheringControls } from '@/components/ui/dithering-controls';
import type { GeneratorSettings } from '../lib/types';

type AdvancedSettingsProps = {
    settings: GeneratorSettings;
    onSettingsChange: (settings: Partial<GeneratorSettings>) => void;
};

export function AdvancedSettings({
    settings,
    onSettingsChange,
}: AdvancedSettingsProps) {
    const updateSettings = (updates: Partial<GeneratorSettings>) => {
        onSettingsChange(updates);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <Tran text="generator-logic-display.advanced-settings" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <Tran text="generator-logic-display.advanced-settings" />
                    </DialogTitle>
                    <DialogDescription>
                        <Tran
                            text="generator-logic-display.advanced-settings-desc"
                        />
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Ignore Border */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="ignore-border" className="text-base">
                                <Tran text="generator-logic-display.ignore-border" />
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <Tran
                                    text="generator-logic-display.ignore-border-desc"
                                />
                            </p>
                        </div>
                        <Switch
                            id="ignore-border"
                            checked={settings.ignoreBorder}
                            onCheckedChange={(checked) => updateSettings({ ignoreBorder: checked })}
                        />
                    </div>

                    {/* Bezel Compensation (Gap) */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="bezel-compensation" className="text-base">
                                <Tran text="generator-logic-display.bezel-compensation" />
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <Tran
                                    text="generator-logic-display.bezel-compensation-desc"
                                />
                            </p>
                        </div>
                        <Switch
                            id="bezel-compensation"
                            checked={settings.bezelCompensation}
                            onCheckedChange={(checked) => updateSettings({ bezelCompensation: checked })}
                        />
                    </div>

                    {/* Dithering */}
                    <div className="space-y-2">
                        <Label className="text-base">
                            <Tran text="generator-logic-display.dithering" />
                        </Label>
                        <DitheringControls
                            settings={settings.dithering}
                            onChange={(dithering) => updateSettings({ dithering })}
                            className="space-y-4"
                        />
                    </div>

                    {/* Screen Name */}
                    <div className="space-y-2">
                        <Label htmlFor="screen-name">
                            <Tran text="generator-logic-display.screen-name" />
                        </Label>
                        <Input
                            id="screen-name"
                            value={settings.screenName}
                            onChange={(e) => updateSettings({ screenName: e.target.value })}
                            placeholder="display1"
                        />
                        <p className="text-xs text-muted-foreground">
                            <Tran
                                text="generator-logic-display.screen-name-hint"
                            />
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
