'use client';

import React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';
import { ImageUpload } from './ImageUpload';
import { cn } from '@/lib/utils';

export interface ImageInputPanelProps {
    /** Translation prefix for labels */
    translationPrefix: string;
    /** Panel title */
    title?: string;

    // Image state
    imageFile: File | null;
    onImageSelected: (file: File | null) => void;
    imageSrc: string | null;

    // Crop state
    crop?: Crop;
    onCropChange: (crop: Crop) => void;
    onCropComplete: (crop: PixelCrop) => void;
    aspectRatio?: number;

    // Container
    containerRef: React.RefObject<HTMLDivElement>;
    containerSize: number;
    imgRef: React.RefObject<HTMLImageElement>;
    onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;

    /** Optional className */
    className?: string;
    /** Optional hidden canvas for processing */
    hiddenCanvas?: React.ReactNode;
}

/**
 * Shared image input panel with upload and crop functionality
 */
export function ImageInputPanel({
    translationPrefix,
    title,
    imageFile,
    onImageSelected,
    imageSrc,
    crop,
    onCropChange,
    onCropComplete,
    aspectRatio,
    containerRef,
    containerSize,
    imgRef,
    onImageLoad,
    className,
    hiddenCanvas,
}: ImageInputPanelProps) {
	const { t } = useI18n();
	return (
        <div className={cn('rounded-lg border p-3 md:p-4 h-full flex flex-col gap-4 min-h-0', className)}>
            <h3 className="text-base font-semibold">
                {title || <Tran text={`${translationPrefix}.image-input` as 'generator-canvas.image-input'} />}
            </h3>

            <div className="flex flex-col gap-4 flex-1 min-h-0">
                {/* Image container */}
                <div
                    ref={containerRef}
                    className="aspect-square w-full flex items-center justify-center rounded overflow-hidden relative border bg-black/5 min-h-0"
                >
                    {!imageFile || !imageSrc ? (
                        <ImageUpload
                            onImageSelected={onImageSelected}
                            className="h-full w-full border-0 bg-transparent min-h-0"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-1.5">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => onCropChange(percentCrop)}
                                onComplete={(c) => onCropComplete(c)}
                                aspect={aspectRatio}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
								alt={t('upload-alt')}
                                    onLoad={onImageLoad}
                                    style={{
                                        display: 'block',
                                        maxWidth: `${containerSize}px`,
                                        maxHeight: `${containerSize}px`,
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            </ReactCrop>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for processing */}
                {hiddenCanvas}

                {/* Upload button */}
                <Button
                    variant="outline"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) onImageSelected(file);
                        };
                        input.click();
                    }}
                    className="w-full mt-auto truncate"
                >
                    <Tran text={`${translationPrefix}.upload-image` as 'generator-canvas.upload-image'} />
                </Button>
            </div>
        </div>
    );
}
