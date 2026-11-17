'use client';

import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface ImageUploadProps {
    /** Callback when image file is selected */
    onImageSelected: (file: File) => void;
    /** Additional CSS classes */
    className?: string;
    /** Translation key prefix (reserved for future use) */
    translationPrefix?: string;
}

/**
 * Shared image upload component with drag-and-drop support
 */
export function ImageUpload({
    onImageSelected,
    className,
    translationPrefix: _translationPrefix,
}: ImageUploadProps) {
	const { t } = useI18n();
	const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find((file) => file.type.startsWith('image/'));

            if (imageFile) {
                onImageSelected(imageFile);
            }
        },
        [onImageSelected],
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onImageSelected(file);
            }
        },
        [onImageSelected],
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={cn(
                'relative flex min-h-75 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-primary hover:bg-accent',
                isDragging && 'border-primary bg-accent',
                className,
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
				aria-label={t('upload-image')}
            />

            <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
    );
}
