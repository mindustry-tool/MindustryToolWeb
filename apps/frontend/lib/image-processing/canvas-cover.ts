/**
 * Resize and crop canvas to exact dimensions using cover mode (fill)
 * Similar to CSS object-fit: cover
 */
export function resizeCanvasCover(
    canvas: HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number,
): HTMLCanvasElement {
    const imageAspect = canvas.width / canvas.height;
    const targetAspect = targetWidth / targetHeight;

    let scaleWidth, scaleHeight;
    let cropX = 0, cropY = 0;

    if (imageAspect > targetAspect) {
        // Image is wider, scale to height and crop width
        scaleHeight = targetHeight;
        scaleWidth = targetHeight * imageAspect;
        cropX = (scaleWidth - targetWidth) / 2;
    } else {
        // Image is taller, scale to width and crop height
        scaleWidth = targetWidth;
        scaleHeight = targetWidth / imageAspect;
        cropY = (scaleHeight - targetHeight) / 2;
    }

    // Create canvas with exact target dimensions
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const ctx = resizedCanvas.getContext('2d');
    if (ctx) {
        // Draw scaled image, cropping excess
        ctx.drawImage(canvas, -cropX, -cropY, scaleWidth, scaleHeight);
    }

    return resizedCanvas;
}
