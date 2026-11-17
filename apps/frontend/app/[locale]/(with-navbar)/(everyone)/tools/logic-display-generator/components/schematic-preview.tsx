'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Tran } from '@/i18n/tran';
import environment from '@/config/environment';

interface SchematicPreviewProps {
    schematicBlob: Blob | null;
    onError?: (error: string) => void;
}

export function SchematicPreview({ schematicBlob, onError }: SchematicPreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!schematicBlob) {
            setTimeout(() => {
                setPreviewUrl(null);
            }, 0);
            return;
        }

        const fetchPreview = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append('file', schematicBlob, 'schematic.msch');

                const response = await fetch(`${environment.url.apiV4}/schematics/image`, {
                    method: 'POST',
                    body: formData,
                    signal: AbortSignal.timeout(15000),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate preview');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                // Clean up old URL before setting new one
                if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                }

                previewUrlRef.current = url;
                setPreviewUrl(url);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMsg);
                onError?.(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();

        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
        };
    }, [schematicBlob, onError]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                    <Tran text="generator-logic-display.loading-preview" />
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    if (previewUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={previewUrl}
                alt="Schematic Preview"
                className="w-full h-full object-contain"
            />
        );
    }

    return null;
}
