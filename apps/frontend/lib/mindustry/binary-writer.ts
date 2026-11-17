/**
 * BinaryWriter - Utility class for writing binary data in Big Endian format
 * Used for generating Mindustry schematic files (.msch)
 */
export class BinaryWriter {
    private buffer: number[] = [];
    private encoder = new TextEncoder();

    /**
     * Write a single byte (8 bits)
     */
    writeByte(value: number): void {
        this.buffer.push(value & 0xff);
    }

    /**
     * Write a short (16 bits, Big Endian)
     */
    writeShort(value: number): void {
        this.buffer.push((value >> 8) & 0xff);
        this.buffer.push(value & 0xff);
    }

    /**
     * Write an integer (32 bits, Big Endian)
     */
    writeInt(value: number): void {
        this.buffer.push((value >> 24) & 0xff);
        this.buffer.push((value >> 16) & 0xff);
        this.buffer.push((value >> 8) & 0xff);
        this.buffer.push(value & 0xff);
    }

    /**
     * Write a UTF-8 string (length-prefixed with short)
     */
    writeString(str: string): void {
        const bytes = this.encoder.encode(str);
        this.writeShort(bytes.length);
        for (const byte of bytes) {
            this.buffer.push(byte);
        }
    }

    /**
     * Get the current buffer as Uint8Array
     */
    getBuffer(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    /**
     * Get the raw buffer array (for advanced use)
     */
    getRawBuffer(): number[] {
        return this.buffer;
    }

    /**
     * Clear the buffer
     */
    clear(): void {
        this.buffer = [];
    }

    /**
     * Get the current buffer length
     */
    getLength(): number {
        return this.buffer.length;
    }
}
