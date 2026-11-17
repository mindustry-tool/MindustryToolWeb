/**
 * Shared Crop Worker
 * 
 * Handles image cropping in a worker thread using createImageBitmap + OffscreenCanvas.
 * Used by Logic Display Generator and Canvas Generator.
 * 
 * Benefits:
 * - createImageBitmap bypasses fingerprinting protection
 * - All heavy operations run off main thread
 * - ImageBitmap transfer is zero-copy
 */

export interface CropWorkerMessage {
    type: 'crop';
    bitmap: ImageBitmap;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
}

export interface CropWorkerResult {
    type: 'success' | 'error';
    imageData?: ImageData;
    error?: string;
}

self.onmessage = async (e: MessageEvent<CropWorkerMessage>) => {
    const { bitmap, cropX, cropY, cropWidth, cropHeight } = e.data;

    try {
        // Crop using createImageBitmap (efficient, bypasses fingerprinting)
        const croppedBitmap = await createImageBitmap(
            bitmap,
            cropX,
            cropY,
            cropWidth,
            cropHeight
        );

        // Close original bitmap to free memory
        bitmap.close();

        // Draw to OffscreenCanvas to extract ImageData
        const canvas = new OffscreenCanvas(cropWidth, cropHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.drawImage(croppedBitmap, 0, 0);

        // Close cropped bitmap to free memory
        croppedBitmap.close();

        // Extract ImageData for pica to resize on main thread
        const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);

        self.postMessage({
            type: 'success',
            imageData,
        } as CropWorkerResult);
    } catch (error) {
        // Ensure bitmap is closed even on error
        try { bitmap.close(); } catch { /* ignore */ }

        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        } as CropWorkerResult);
    }
};
