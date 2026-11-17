import { PixelGrid } from './types';
import { BinaryWriter } from '@/lib/mindustry/binary-writer';
import { createSchematicBlob } from '@/lib/mindustry/schematic-utils';

export class SchematicWriter {
    private writer = new BinaryWriter();

    async generate(grid: PixelGrid, width: number, height: number, tags: Record<string, string>, blockType: string): Promise<Blob> {
        this.writer.clear();

        this.writer.writeShort(width);
        this.writer.writeShort(height);

        // Tags
        const tagKeys = Object.keys(tags);
        this.writer.writeByte(tagKeys.length);
        for (const key of tagKeys) {
            this.writer.writeString(key);
            this.writer.writeString(tags[key] || '');
        }

        // Collect Blocks and Create Dictionary
        // We only use one block type (sorter or inverted-sorter), but we must follow the format.
        // Format: Length (Byte) -> Names (String).
        // Then tiles refer to index in this list.

        const blockNames = [blockType]; // We assume all non-null cells use this block type
        // If we had multiple types, we'd need a Set.

        this.writer.writeByte(blockNames.length);
        for (const name of blockNames) {
            this.writer.writeString(name);
        }

        // Flatten grid to get tiles
        const tiles = [];
        for (let y = 0; y < grid.length; y++) {
            const row = grid[y];
            if (!row) continue;
            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (cell) {
                    tiles.push(cell);
                }
            }
        }

        this.writer.writeInt(tiles.length); // Total tiles (Int)

        for (const tile of tiles) {
            // Block Index (Byte)
            // Since we only have one block type in the dictionary at index 0:
            this.writer.writeByte(0);

            // Position (Int) - Packed (x << 16) | y
            // Mindustry uses bottom-left origin, so flip Y
            const y = height - 1 - tile.y;
            const packedPos = (tile.x << 16) | (y & 0xFFFF);
            this.writer.writeInt(packedPos);

            // Config (Object) - TypeIO format
            // Sorter config is an Item (Content).
            // TypeIO.writeObject(Content):
            // 1. Byte 5 (Object Type: Content)
            // 2. Byte 0 (Content Type: Item)
            // 3. Short ItemID

            const itemId = ITEM_IDS[tile.material];
            if (itemId === undefined) {
                console.warn(`Unknown material: ${tile.material}`);
                this.writer.writeByte(0); // Write Null (Type 0) if unknown
            } else {
                this.writer.writeByte(5); // Object Type: Content
                this.writer.writeByte(0); // Content Type: Item
                this.writer.writeShort(itemId); // Item ID
            }

            // Rotation (Byte)
            this.writer.writeByte(0);
        }

        const dataArray = this.writer.getBuffer();
        return await createSchematicBlob(dataArray);
    }
}

// Item IDs (Mindustry v7/v8)
// Based on standard content list order
export const ITEM_IDS: Record<string, number> = {
    'copper': 0,
    'lead': 1,
    'metaglass': 2,
    'graphite': 3,
    'sand': 4,
    'coal': 5,
    'titanium': 6,
    'thorium': 7,
    'scrap': 8,
    'silicon': 9,
    'plastanium': 10,
    'phase-fabric': 11,
    'surge-alloy': 12,
    'spore-pod': 13,
    'blast-compound': 14,
    'pyratite': 15,
    'beryllium': 16,
    'tungsten': 17,
    'oxide': 18,
    'carbide': 19,
};
