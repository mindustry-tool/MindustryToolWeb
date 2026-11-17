'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';
import { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';

export interface UseImageInputOptions {
    /** Aspect ratio for crop (optional - free crop if not provided) */
    aspectRatio?: number;
}

export interface UseImageInputReturn {
    // Image state
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    imageSrc: string | null;

    // Crop state
    crop: Crop | undefined;
    setCrop: (crop: Crop) => void;
    completedCrop: PixelCrop | undefined;
    setCompletedCrop: (crop: PixelCrop) => void;

    // Container refs
    imgRef: React.RefObject<HTMLImageElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerSize: number;

    // Actions
    onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    resetImage: () => void;

    // Helpers
    getCroppedImageData: () => ImageData | null;
}

/**
 * Helper to create a centered aspect crop
 */
function createCenterAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect?: number,
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 100,
            },
            aspect || mediaWidth / mediaHeight,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

/**
 * Hook for managing image input with crop functionality
 * Used by all generator tools
 */
export function useImageInput(options: UseImageInputOptions = {}): UseImageInputReturn {
    const { aspectRatio } = options;

    // Image state
    const [imageFile, setImageFileState] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    // Crop state
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Refs
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<number>(0);

    // Custom setImageFile that also resets state when null
    const setImageFile = useCallback((file: File | null) => {
        setImageFileState(file);
        if (!file) {
            setImageSrc(null);
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    }, []);

    // Load image when file changes (only when file is set)
    useEffect(() => {
        if (!imageFile) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || null);
        });
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    // Observe container resize
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                setContainerSize(width);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Handle image load - set initial crop
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight, width, height } = e.currentTarget;

        const initialCrop = createCenterAspectCrop(
            naturalWidth,
            naturalHeight,
            aspectRatio,
        );

        setCrop(initialCrop);

        // Also set completed crop in pixel coordinates
        const pixelCrop = convertToPixelCrop(
            initialCrop,
            width,
            height,
        );
        setCompletedCrop(pixelCrop);
    }, [aspectRatio]);

    // Reset image state
    const resetImage = useCallback(() => {
        setImageFileState(null);
        setImageSrc(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
    }, []);

    // Get cropped image data from canvas
    const getCroppedImageData = useCallback((): ImageData | null => {
        if (!imgRef.current || !completedCrop) return null;

        const img = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Calculate scale between displayed and natural size
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        // Set canvas size to crop size
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        // Draw cropped area
        ctx.drawImage(
            img,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [completedCrop]);

    return {
        imageFile,
        setImageFile,
        imageSrc,
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        imgRef,
        containerRef,
        containerSize,
        onImageLoad,
        resetImage,
        getCroppedImageData,
    };
}
