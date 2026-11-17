/**
 * Utility functions for Mindustry schematic file operations
 */

/**
 * Mindustry schematic file header (magic bytes: "msch")
 */
export const SCHEMATIC_HEADER = new TextEncoder().encode('msch');

/**
 * Mindustry schematic format version
 */
export const SCHEMATIC_VERSION = 1;

/**
 * Compress data using deflate compression
 * @param data Uncompressed data
 * @returns Compressed data as ArrayBuffer
 */
export async function compressSchematicData(
    data: Uint8Array
): Promise<ArrayBuffer> {
    const stream = new Blob([data.buffer as ArrayBuffer]).stream();
    const compressedStream = stream.pipeThrough(
        new CompressionStream('deflate')
    );
    const compressedBuffer = await new Response(compressedStream).arrayBuffer();
    return compressedBuffer;
}

/**
 * Create a Mindustry schematic blob from uncompressed data
 * @param uncompressedData The schematic data to compress and package
 * @returns A Blob containing the complete .msch file
 */
export async function createSchematicBlob(
    uncompressedData: Uint8Array
): Promise<Blob> {
    // Compress the data
    const compressedBuffer = await compressSchematicData(uncompressedData);

    // Construct final buffer: Header (4 bytes) + Version (1 byte) + Compressed Data
    const finalBuffer = new Uint8Array(
        SCHEMATIC_HEADER.length + 1 + compressedBuffer.byteLength
    );

    finalBuffer.set(SCHEMATIC_HEADER, 0);
    finalBuffer[SCHEMATIC_HEADER.length] = SCHEMATIC_VERSION;
    finalBuffer.set(
        new Uint8Array(compressedBuffer),
        SCHEMATIC_HEADER.length + 1
    );

    return new Blob([finalBuffer.buffer], { type: 'application/octet-stream' });
}
