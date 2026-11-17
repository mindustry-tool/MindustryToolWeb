import type { RGB, LAB, ColorSpace } from './types';

/**
 * Convert RGB to XYZ color space (intermediate for LAB conversion)
 */
function rgbToXyz(rgb: RGB): [number, number, number] {
    const [r255, g255, b255] = rgb;
    let r = r255 / 255;
    let g = g255 / 255;
    let b = b255 / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;

    // Observer = 2°, Illuminant = D65
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return [x, y, z];
}

/**
 * Convert XYZ to LAB color space
 */
function xyzToLab([x, y, z]: [number, number, number]): LAB {
    // Reference white D65
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
    const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
    const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

    const l = (116 * fy) - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);

    return [l, a, b];
}

/**
 * Convert RGB to LAB color space
 * LAB space is perceptually uniform - better for human vision
 */
export function rgbToLab(rgb: RGB): LAB {
    const xyz = rgbToXyz(rgb);
    return xyzToLab(xyz);
}

/**
 * Convert LAB to XYZ color space
 */
function labToXyz([l, a, b]: LAB): [number, number, number] {
    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const x3 = Math.pow(x, 3);
    const y3 = Math.pow(y, 3);
    const z3 = Math.pow(z, 3);

    x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
    y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
    z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

    // Reference white D65
    x *= 95.047;
    y *= 100.000;
    z *= 108.883;

    return [x, y, z];
}

/**
 * Convert XYZ to RGB color space
 */
function xyzToRgb([x, y, z]: [number, number, number]): RGB {
    x /= 100;
    y /= 100;
    z /= 100;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    // Clamp to valid range
    r = Math.max(0, Math.min(1, r)) * 255;
    g = Math.max(0, Math.min(1, g)) * 255;
    b = Math.max(0, Math.min(1, b)) * 255;

    return [Math.round(r), Math.round(g), Math.round(b)];
}

/**
 * Convert LAB to RGB color space
 */
export function labToRgb(lab: LAB): RGB {
    const xyz = labToXyz(lab);
    return xyzToRgb(xyz);
}

/**
 * Calculate Euclidean distance in RGB color space
 */
export function colorDistanceRGB(c1: RGB, c2: RGB): number {
    const [r1, g1, b1] = c1;
    const [r2, g2, b2] = c2;

    // Weighted RGB distance (human eye is more sensitive to green)
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;

    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

/**
 * Calculate Euclidean distance in LAB color space
 * More perceptually accurate than RGB
 */
export function colorDistanceLAB(c1: LAB, c2: LAB): number {
    const [l1, a1, b1] = c1;
    const [l2, a2, b2] = c2;

    const dl = l1 - l2;
    const da = a1 - a2;
    const db = b1 - b2;

    return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * Calculate color distance using specified color space
 */
export function colorDistance(
    c1: RGB,
    c2: RGB,
    space: ColorSpace = 'rgb'
): number {
    if (space === 'lab') {
        const lab1 = rgbToLab(c1);
        const lab2 = rgbToLab(c2);
        return colorDistanceLAB(lab1, lab2);
    }

    return colorDistanceRGB(c1, c2);
}

/**
 * Find closest color in palette
 */
export function findClosestColor(
    color: RGB,
    palette: RGB[],
    colorSpace: ColorSpace = 'rgb'
): { color: RGB; index: number } {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < palette.length; i++) {
        const distance = colorDistance(color, palette[i]!, colorSpace);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    return {
        color: palette[closestIndex]!,
        index: closestIndex
    };
}
