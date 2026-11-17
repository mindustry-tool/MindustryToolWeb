/**
 * Load image file into a canvas element with optional grid rounding
 * @param file - Image file to load
 * @param gridMultiple - Optional grid size to round dimensions to (default: 1 = no rounding)
 * @param maxSize - Optional maximum dimension to constrain image size
 * @returns Promise resolving to HTMLCanvasElement with loaded image
 */
export async function loadImageToCanvas(
    file: File,
    gridMultiple: number = 1,
    maxSize?: number,
): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                let targetWidth = img.width;
                let targetHeight = img.height;

                // Apply max size constraint if specified
                if (maxSize) {
                    const maxDimension = Math.max(targetWidth, targetHeight);
                    if (maxDimension > maxSize) {
                        const scale = maxSize / maxDimension;
                        targetWidth = Math.floor(targetWidth * scale);
                        targetHeight = Math.floor(targetHeight * scale);
                    }
                }

                // Round dimensions to nearest multiple of gridMultiple
                if (gridMultiple > 1) {
                    targetWidth = Math.round(targetWidth / gridMultiple) * gridMultiple;
                    targetHeight = Math.round(targetHeight / gridMultiple) * gridMultiple;
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Disable smoothing for pixel-perfect scaling
                // This preserves sharp edges for subsequent area-averaging downscale in the worker
                ctx.imageSmoothingEnabled = false;

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                resolve(canvas);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
