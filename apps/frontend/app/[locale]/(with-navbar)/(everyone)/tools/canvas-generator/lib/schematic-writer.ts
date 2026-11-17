import { PixelGrid } from './types';
import { BinaryWriter } from '@/lib/mindustry/binary-writer';
import { createSchematicBlob } from '@/lib/mindustry/schematic-utils';

export class SchematicWriter {
    private writer = new BinaryWriter();

    private packColorsToBits(colors: number[]): number[] {
        const bitsPerPixel = 3;
        const totalBits = colors.length * bitsPerPixel;
        const byteCount = Math.ceil(totalBits / 8);
        const bytes: number[] = new Array(byteCount).fill(0);

        for (let i = 0; i < colors.length; i++) {
            const colorIndex = colors[i]! & 0x7;
            const bitOffset = i * bitsPerPixel;
            const byteIndex = Math.floor(bitOffset / 8);
            const bitPosition = bitOffset % 8;

            if (bitPosition + bitsPerPixel <= 8) {
                bytes[byteIndex]! |= (colorIndex << bitPosition);
            } else {
                bytes[byteIndex]! |= (colorIndex << bitPosition);
                bytes[byteIndex + 1]! |= (colorIndex >> (8 - bitPosition));
            }
        }

        return bytes;
    }

    async generate(grid: PixelGrid, width: number, height: number, tags: Record<string, string>, blockType: string): Promise<Blob> {
        this.writer.clear();

        const canvasBlocks = this.groupIntoCanvasBlocks(grid, width, height);

        // width and height are grid dimensions in pixels
        // Need to divide by 12 to get number of canvas blocks (each block is 12x12 internal pixels)
        const canvasBlocksX = Math.ceil(width / 12);
        const canvasBlocksY = Math.ceil(height / 12);
        const schematicWidth = canvasBlocksX * 2;
        const schematicHeight = canvasBlocksY * 2;

        this.writer.writeShort(schematicWidth);
        this.writer.writeShort(schematicHeight);

        const tagKeys = Object.keys(tags);
        this.writer.writeByte(tagKeys.length);
        for (const key of tagKeys) {
            this.writer.writeString(key);
            this.writer.writeString(tags[key] || '');
        }

        const blockNames = [blockType];
        this.writer.writeByte(blockNames.length);
        for (const name of blockNames) {
            this.writer.writeString(name);
        }

        this.writer.writeInt(canvasBlocks.length);

        for (const block of canvasBlocks) {
            this.writer.writeByte(0);

            const worldX = block.x * 2;
            const worldY = block.y * 2;

            // Fix Y position: 
            // - Schematic Y is bottom-up (0 at bottom)
            // - block.y is top-down (0 at top)
            // - Blocks are 2x2, anchor is bottom-left
            // - Top block (block.y=0) should be at y = Height - 2 (covering Height-2 and Height-1)
            const y = schematicHeight - 2 - worldY;

            const packedPos = (worldX << 16) | (y & 0xFFFF);
            this.writer.writeInt(packedPos);

            this.writer.writeByte(14);

            const packedBytes = this.packColorsToBits(block.colors);
            this.writer.writeInt(packedBytes.length);

            for (const byte of packedBytes) {
                this.writer.writeByte(byte);
            }

            this.writer.writeByte(0);
        }

        const dataArray = this.writer.getBuffer();
        return await createSchematicBlob(dataArray);
    }

    private groupIntoCanvasBlocks(grid: PixelGrid, gridWidth: number, gridHeight: number) {
        const blocks = [];
        // gridWidth and gridHeight are in pixels, divide by 12 for canvas blocks
        const canvasBlocksX = Math.ceil(gridWidth / 12);
        const canvasBlocksY = Math.ceil(gridHeight / 12);

        for (let by = 0; by < canvasBlocksY; by++) {
            for (let bx = 0; bx < canvasBlocksX; bx++) {
                const colors: number[] = [];

                // Revert to Row-Major (y then x) as confirmed by Mindustry source
                for (let py = 0; py < 12; py++) {
                    for (let px = 0; px < 12; px++) {
                        const gridX = bx * 12 + px;
                        const gridY = by * 12 + py;

                        let colorId = 0;

                        if (gridY >= 0 && gridY < grid.length && grid[gridY]) {
                            const row = grid[gridY];
                            if (row && gridX < row.length && row[gridX]) {
                                const cell = row[gridX];
                                if (cell) {
                                    colorId = COLOR_IDS[cell.material] ?? 0;
                                }
                            }
                        }

                        colors.push(colorId);
                    }
                }

                blocks.push({
                    x: bx,
                    y: by,
                    colors: colors
                });
            }
        }

        return blocks;
    }
}

export const COLOR_IDS: Record<string, number> = {
    'canvas-color-1': 0,
    'canvas-color-2': 1,
    'canvas-color-3': 2,
    'canvas-color-4': 3,
    'canvas-color-5': 4,
    'canvas-color-6': 5,
    'canvas-color-7': 6,
    'canvas-color-8': 7,
};
