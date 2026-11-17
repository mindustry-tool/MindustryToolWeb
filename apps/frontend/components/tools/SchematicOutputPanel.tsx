'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tran } from '@/i18n/tran';
import { SchematicActions } from './SchematicActions';
import { ProcessingOverlay } from './ProcessingOverlay';
import type { SchematicFile } from '@/lib/tools';
import type { WorkerProgressStep } from '@/lib/image-processing/worker';
import { cn } from '@/lib/utils';

export interface SchematicOutputPanelProps {
    /** Translation prefix for labels */
    translationPrefix: string;
    /** Panel title */
    title?: string;

    // Preview content
    previewContent?: React.ReactNode;
    hasPreview: boolean;

    // Processing state
    isProcessing?: boolean;
    progress?: number;
    currentStep?: WorkerProgressStep | null;
    stepMessage?: string | null;
    onCancelProcessing?: () => void;

    // Schematic files
    schematicFiles: SchematicFile[];
    onDownload: () => void;
    onCopyClick: () => void;

    // Additional content (OutputInfoPanel, etc.)
    additionalContent?: React.ReactNode;

    // Header actions (grid toggle, etc.)
    headerActions?: React.ReactNode;

    /** Optional className */
    className?: string;
}

/**
 * Shared schematic output panel with preview and actions
 */
export function SchematicOutputPanel({
    translationPrefix,
    title,
    previewContent,
    hasPreview,
    isProcessing = false,
    progress = 0,
    currentStep,
    stepMessage,
    onCancelProcessing,
    schematicFiles,
    onDownload,
    onCopyClick,
    additionalContent,
    headerActions,
    className,
}: SchematicOutputPanelProps) {
    return (
        <div className={cn('rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4', className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                    {title || <Tran text={`${translationPrefix}.schematic-output` as 'generator-canvas.schematic-output'} />}
                </h3>
                {headerActions}
            </div>

            {/* Preview container */}
            <div className="aspect-square w-full flex items-center justify-center bg-black/5 rounded overflow-hidden relative border min-h-0">
                {/* Custom preview content */}
                {previewContent}

                {/* No preview placeholder */}
                {!hasPreview && !isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">
                            <Tran text={`${translationPrefix}.no-preview` as 'generator-canvas.no-preview'} />
                        </p>
                    </div>
                )}

                {/* Simple processing indicator (for generators without worker) */}
                {isProcessing && !currentStep && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm mt-2">
                            <Tran text={`${translationPrefix}.processing` as 'generator-canvas.processing'} />
                        </p>
                    </div>
                )}

                {/* Full processing overlay (for generators with worker) */}
                {currentStep && (
                    <ProcessingOverlay
                        isVisible={isProcessing}
                        progress={progress}
                        currentStep={currentStep}
                        stepMessage={stepMessage}
                        onCancel={onCancelProcessing}
                    />
                )}
            </div>

            {/* Additional content (OutputInfoPanel, etc.) */}
            {additionalContent}

            {/* Schematic actions */}
            {hasPreview && (
                <SchematicActions
                    files={schematicFiles}
                    onDownload={onDownload}
                    onCopyClick={onCopyClick}
                    className="mt-auto"
                />
            )}
        </div>
    );
}
