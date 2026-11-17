'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { Copy } from 'lucide-react';
import type { SchematicFile } from '@/lib/tools/types';

export interface CopyDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** List of schematic files to choose from */
    files: SchematicFile[];
    /** Callback when a file is selected for copying */
    onCopy: (blob: Blob, filename: string) => void;
    /** Translation key prefix (default: 'tools') */
    translationPrefix?: string;
}

/**
 * Dialog for selecting which schematic to copy when there are multiple files
 */
export function CopyDialog({
    open,
    onOpenChange,
    files,
    onCopy,
    translationPrefix = 'tools',
}: CopyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <Tran
                            text={`${translationPrefix}.select-schematic-copy` as Lowercase<string>}
                        />
                    </DialogTitle>
                    <DialogDescription>
                        <Tran
                            text={`${translationPrefix}.copy-desc` as Lowercase<string>}
                        />
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                    {files.map((file, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start font-mono text-xs"
                            onClick={() => onCopy(file.blob, file.filename)}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            {file.filename}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
