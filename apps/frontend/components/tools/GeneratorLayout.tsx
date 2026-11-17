'use client';

import React from 'react';
import { PageWrapper } from '@/components/common/page-wrapper';
import { cn } from '@/lib/utils';

export interface GeneratorLayoutProps {
    /** Left column: Image input */
    imageInput: React.ReactNode;
    /** Center column: Schematic output/preview */
    schematicOutput: React.ReactNode;
    /** Right column: Settings */
    settings: React.ReactNode;
    /** Optional: Dialog components (CopyDialog, etc.) */
    dialogs?: React.ReactNode;
    /** Optional: Additional className for the grid */
    className?: string;
}

/**
 * Shared 3-column layout for all generator tools
 * - Left: Image input with crop
 * - Center: Schematic preview/output
 * - Right: Settings panel
 */
export function GeneratorLayout({
    imageInput,
    schematicOutput,
    settings,
    dialogs,
    className,
}: GeneratorLayoutProps) {
    return (
        <PageWrapper className="h-[calc(100dvh-64px)]">
            <div
                className={cn(
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6',
                    'w-full max-w-(--breakpoint-2xl) mx-auto',
                    'h-full overflow-hidden',
                    className,
                )}
            >
                {/* Column 1: Image Input */}
                <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
                    {imageInput}
                </div>

                {/* Column 2: Schematic Output */}
                <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
                    {schematicOutput}
                </div>

                {/* Column 3: Settings */}
                <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0 col-span-2 lg:col-span-1">
                    {settings}
                </div>
            </div>

            {/* Dialogs (CopyDialog, etc.) */}
            {dialogs}
        </PageWrapper>
    );
}
