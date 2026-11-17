import { createHash } from 'crypto';

export const CHUNK_HEADER_SIZE = 20;
export const MAX_CHUNK_BYTES = 64 * 1024; // 64 KiB
export const MAX_STREAM_BYTES = 33554432;
export const MAX_CONCURRENT_STREAMS = 8;
export const SLOT_CEILING_MS = 300_000;

/**
 * Encode a UUID string as 16 raw bytes (MSB first, LSB last) in a Buffer.
 * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (32 hex digits, 16 bytes).
 */
export function uuidToBytes(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

/**
 * Decode 16 raw bytes (from offset in buf) to a hyphenated UUID string.
 */
export function bytesToUuid(buf: Buffer, offset = 0): string {
  const hex = buf.subarray(offset, offset + 16).toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/**
 * Encode a single chunk frame.
 *   bytes 0-15 : transferId (16 bytes, UUID big-endian)
 *   bytes 16-19: chunkIndex (int32 BE)
 *   bytes 20-N : payload bytes
 */
export function encodeChunk(transferId: string, chunkIndex: number, payload: Buffer): Buffer {
  const header = Buffer.allocUnsafe(CHUNK_HEADER_SIZE);
  const idBytes = uuidToBytes(transferId);
  idBytes.copy(header, 0);
  header.writeInt32BE(chunkIndex, 16);
  return Buffer.concat([header, payload]);
}

/**
 * Decode a binary chunk frame.  Returns null when the frame is too short.
 */
export interface DecodedChunk {
  transferId: string;
  chunkIndex: number;
  payload: Buffer;
}

export function decodeChunk(frame: Buffer): DecodedChunk | null {
  if (frame.length < CHUNK_HEADER_SIZE) return null;
  const transferId = bytesToUuid(frame, 0);
  const chunkIndex = frame.readInt32BE(16);
  const payload = frame.subarray(CHUNK_HEADER_SIZE);
  return { transferId, chunkIndex, payload };
}

/**
 * Slice a complete file buffer into ordered chunk frames.
 */
export function sliceIntoChunks(transferId: string, data: Buffer): Buffer[] {
  if (data.length === 0) {
    return [encodeChunk(transferId, 0, Buffer.alloc(0))];
  }

  const frames: Buffer[] = [];
  let offset = 0;
  let index = 0;
  while (offset < data.length) {
    const slice = data.subarray(offset, offset + MAX_CHUNK_BYTES);
    frames.push(encodeChunk(transferId, index, slice));
    offset += slice.length;
    index++;
  }
  return frames;
}

/**
 * Compute the SHA-256 hex digest of a buffer.
 */
export function sha256Hex(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Verify the SHA-256 hex digest of a buffer.
 */
export function verifySha256(data: Buffer, expectedHex: string): boolean {
  const actual = sha256Hex(data);
  return actual.toLowerCase() === expectedHex.toLowerCase();
}
