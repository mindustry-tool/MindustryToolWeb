'use client';

import { useI18n } from '@/i18n/i18n.client';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import type { SchematicFile } from '@/lib/tools/types';

export interface SchematicActionsProps {
    /** List of schematic files */
    files: SchematicFile[];
    /** Callback for download action */
    onDownload: () => void;
    /** Callback for copy action (single file) or opening dialog (multiple files) */
    onCopyClick: () => void;
    /** Whether buttons are disabled */
    disabled?: boolean;
    /** Additional class name */
    className?: string;
}

/**
 * Download and copy buttons for schematic files
 */
export function SchematicActions({
    files,
    onDownload,
    onCopyClick,
    disabled = false,
    className,
}: SchematicActionsProps) {
    const { t } = useI18n();
    const isDisabled = disabled || files.length === 0;

    return (
        <div className={`flex gap-2 ${className || ''}`}>
            <Button
                onClick={onDownload}
                disabled={isDisabled}
                className="flex-1 truncate"
				title={t('download-schematic')}
            >
                <Download className="h-5 w-5" />
            </Button>

            <Button
                onClick={onCopyClick}
                disabled={isDisabled}
                variant="outline"
                className="flex-1 truncate"
				title={t('copy-to-clipboard')}
            >
                <Copy className="h-5 w-5" />
            </Button>
        </div>
    );
}
