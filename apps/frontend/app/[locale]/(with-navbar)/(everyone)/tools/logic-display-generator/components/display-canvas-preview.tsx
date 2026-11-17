'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tran } from '@/i18n/tran';
import { SchematicActions } from '@/components/tools/SchematicActions';
import { ProcessingOverlay } from '@/components/tools/ProcessingOverlay';
import { SchematicPreview } from './schematic-preview';
import type { SchematicFile } from '@/lib/tools';

export type DisplayCanvasPreviewProps = {
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    previewMode: 'canvas' | 'schematic';
    setPreviewMode: (mode: 'canvas' | 'schematic') => void;
    previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    previewBitmap: ImageBitmap | null;
    isProcessing: boolean;
    generationProgress: number;
    onCancelGeneration: () => void;
    schematicFiles: SchematicFile[];
    onDownload: () => void;
    onCopyClick: () => void;
    imageFile: File | null;
};

export function DisplayCanvasPreview({
    showGrid,
    setShowGrid,
    previewMode,
    setPreviewMode,
    previewCanvasRef,
    previewBitmap,
    isProcessing,
    generationProgress,
    onCancelGeneration,
    schematicFiles,
    onDownload,
    onCopyClick,
    imageFile,
}: DisplayCanvasPreviewProps) {
    return (
        <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
            <div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">
                        <Tran text="generator-logic-display.schematic-output" />
                    </h3>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-grid"
                            checked={showGrid}
                            onCheckedChange={setShowGrid}
                        />
                        <Label htmlFor="show-grid" className="text-xs">
                            <Tran text="generator-logic-display.show-grid" />
                        </Label>
                    </div>
                </div>

                <div className="aspect-square w-full flex items-center justify-center bg-black/5 rounded overflow-hidden relative border min-h-0">
                    {previewMode === 'canvas' ? (
                        <>
                            <canvas
                                ref={previewCanvasRef}
                                className="w-full h-full object-contain"
                            />
                            {!previewBitmap && !isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                    <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">
                                        <Tran text="generator-logic-display.no-preview" />
                                    </p>
                                </div>
                            )}
                            <ProcessingOverlay
                                isVisible={isProcessing}
                                progress={generationProgress}
                                currentStep={generationProgress > 0 ? 'map-colors' : 'resize'}
                                stepMessage={generationProgress > 0 ? `Generating processors... ${generationProgress}%` : 'Processing image...'}
                                onCancel={onCancelGeneration}
                            />
                        </>
                    ) : (
                        <SchematicPreview
                            schematicBlob={schematicFiles[0]?.blob || null}
                            onError={(error) => {
                                toast.error(error);
                                setPreviewMode('canvas');
                            }}
                        />
                    )}

                    {/* Preview Mode Indicator */}
                    <div className="absolute top-2 right-2 z-10">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${previewMode === 'canvas'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : 'bg-green-500/20 text-green-700 dark:text-green-300'
                            }`}>
                            {previewMode === 'canvas' ? (
                                <Tran text="generator-logic-display.canvas-preview" />
                            ) : (
                                <Tran text="generator-logic-display.schematic-preview" />
                            )}
                        </span>
                    </div>
                </div>

                {imageFile && (
                    <SchematicActions
                        files={schematicFiles}
                        onDownload={onDownload}
                        onCopyClick={onCopyClick}
                        className="mt-auto"
                    />
                )}
            </div>
        </div>
    );
}
