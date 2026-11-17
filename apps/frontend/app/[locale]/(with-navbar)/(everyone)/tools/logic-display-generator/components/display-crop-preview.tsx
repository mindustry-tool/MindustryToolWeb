'use client';

import React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/tools/ImageUpload';
import { Tran } from '@/i18n/tran';
import type { GeneratorSettings } from '../lib/types';

export type DisplayCropPreviewProps = {
    imageFile: File | null;
    imageSrc: string | null;
    setImageFile: (file: File) => void;
    crop: Crop | undefined;
    setCrop: (crop: Crop) => void;
    setCompletedCrop: (crop: PixelCrop) => void;
    cropAspectRatio: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerSize: number;
    imgRef: React.RefObject<HTMLImageElement | null>;
    onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    onTriggerChangeImage: () => void;
    settings: GeneratorSettings;
};

export function DisplayCropPreview({
    imageFile,
    imageSrc,
    setImageFile,
    crop,
    setCrop,
    setCompletedCrop,
    cropAspectRatio,
    containerRef,
    containerSize,
    imgRef,
    onImageLoad,
    onTriggerChangeImage,
    settings,
}: DisplayCropPreviewProps) {
    return (
        <div className="space-y-4 md:space-y-6 overflow-y-auto lg:overflow-hidden flex flex-col min-w-0 min-h-0">
            <div className="h-full flex flex-col min-h-0">
                <div className="rounded-lg border p-3 md:p-4 h-full flex flex-col min-h-0 gap-4">
                    <h3 className="text-base font-semibold">
                        <Tran text="generator-logic-display.image-preview" />
                    </h3>

                    <div ref={containerRef} className="aspect-square w-full relative overflow-hidden rounded border bg-muted/30 min-h-0">
                        {!imageFile || !imageSrc ? (
                            <ImageUpload
                                onImageSelected={setImageFile}
                                className="h-full w-full border-0 bg-transparent min-h-0"
                            />
                        ) : (
                            <div
                                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                                style={containerSize > 0 ? {
                                    width: `${containerSize}px`,
                                    height: `${containerSize}px`
                                } : undefined}
                            >
                                <ReactCrop
                                    key={`crop-${settings.displaySize}-${settings.screenX}-${settings.screenY}`}
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={cropAspectRatio}
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
                                        alt="Upload"
                                        onLoad={onImageLoad}
                                        style={{
                                            display: 'block',
                                            maxWidth: `${containerSize}px`,
                                            maxHeight: `${containerSize}px`,
                                            minWidth: '100%',
                                            minHeight: '100%',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </ReactCrop>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={onTriggerChangeImage}
                        className="w-full mt-auto truncate"
                    >
                        <Tran text="generator-logic-display.change-image" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
