'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { SchematicFile } from '../types';

export interface UseSchematicFilesReturn {
    /** Array of generated schematic files */
    schematicFiles: SchematicFile[];
    /** Set schematic files */
    setSchematicFiles: (files: SchematicFile[]) => void;
    /** Whether copy dialog is open */
    showCopyDialog: boolean;
    /** Set copy dialog visibility */
    setShowCopyDialog: (show: boolean) => void;
    /** Download all schematic files */
    handleDownload: () => Promise<void>;
    /** Copy a schematic to clipboard as base64 */
    handleCopy: (blob: Blob, filename: string) => Promise<void>;
    /** Handle copy button click - opens dialog if multiple files */
    handleCopyClick: () => void;
    /** Clear all files */
    clearFiles: () => void;
}

export interface UseSchematicFilesOptions {
    /** Toast message for successful download */
    downloadSuccessMessage?: string;
    /** Toast message for successful copy */
    copySuccessMessage?: (filename: string) => string;
    /** Toast message for copy failure */
    copyFailedMessage?: string;
}

/**
 * Hook for managing schematic file operations (download, copy, dialog)
 */
export function useSchematicFiles(options: UseSchematicFilesOptions = {}): UseSchematicFilesReturn {
    const {
        downloadSuccessMessage = 'Download started!',
        copySuccessMessage = (filename: string) => `Copied ${filename} to clipboard!`,
        copyFailedMessage = 'Failed to copy to clipboard',
    } = options;

    const [schematicFiles, setSchematicFiles] = useState<SchematicFile[]>([]);
    const [showCopyDialog, setShowCopyDialog] = useState(false);

    // Download all schematic files with delay between each
    const handleDownload = useCallback(async () => {
        if (schematicFiles.length === 0) return;

        for (let i = 0; i < schematicFiles.length; i++) {
            const file = schematicFiles[i]!;
            const url = URL.createObjectURL(file.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Add delay between downloads to prevent browser blocking
            if (i < schematicFiles.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        toast.success(downloadSuccessMessage);
    }, [schematicFiles, downloadSuccessMessage]);

    // Copy a schematic blob to clipboard as base64
    const handleCopy = useCallback(async (blob: Blob, filename: string) => {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]!);
            }
            const base64 = btoa(binary);

            await navigator.clipboard.writeText(base64);
            toast.success(copySuccessMessage(filename));
            setShowCopyDialog(false);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error(copyFailedMessage);
        }
    }, [copySuccessMessage, copyFailedMessage]);

    // Handle copy button click - copy directly if single file, show dialog if multiple
    const handleCopyClick = useCallback(() => {
        if (schematicFiles.length === 1 && schematicFiles[0]) {
            handleCopy(schematicFiles[0].blob, schematicFiles[0].filename);
        } else if (schematicFiles.length > 1) {
            setShowCopyDialog(true);
        }
    }, [schematicFiles, handleCopy]);

    // Clear all files
    const clearFiles = useCallback(() => {
        setSchematicFiles([]);
        setShowCopyDialog(false);
    }, []);

    return {
        schematicFiles,
        setSchematicFiles,
        showCopyDialog,
        setShowCopyDialog,
        handleDownload,
        handleCopy,
        handleCopyClick,
        clearFiles,
    };
}
