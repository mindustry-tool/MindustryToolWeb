import { readFile } from 'fs/promises';
import { resolve } from 'path';

let cachedFallbackBuffer: Buffer | null = null;

export async function getFallbackPreviewImage(): Promise<Buffer> {
  if (cachedFallbackBuffer) {
    return cachedFallbackBuffer;
  }

  const assetPath = resolve(__dirname, '../assets/nomap.png');
  cachedFallbackBuffer = await readFile(assetPath);
  return cachedFallbackBuffer;
}
