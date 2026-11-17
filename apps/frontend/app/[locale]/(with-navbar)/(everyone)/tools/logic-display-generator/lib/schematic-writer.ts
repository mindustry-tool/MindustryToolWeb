/**
 * Schematic Writer
 * Handles generation of Mindustry schematic files (.msch)
 * Supports both normal displays and tile-logic-display
 */

import { BinaryWriter } from '@/lib/mindustry/binary-writer';
import { compressSchematicData, createSchematicBlob } from '@/lib/mindustry/schematic-utils';

type ScreenData = {
    size: number;
    pos: { x: number; y: number };
    linkMaxLength: number;
};

type Screen = {
    index: number;
    codes: string[];
    center: { x: number; y: number };
    pos: { x: number; y: number };
};

type LogicBlockInfo = {
    pos: { x: number; y: number };
    index: number;
    code: string;
};

type Direction = { x: number; y: number };

export class SchematicWriter {
    private allScreenSize = { x: 0, y: 0 };
    private linkMaxLength = 12.75;
    private screenList: Screen[] = [];
    private logicBlockList: LogicBlockInfo[] = [];
    private box = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    private point = { x: 0, y: 0 };
    private direction = 0;
    private screenName = '';
    private screenType = '';
    private mschName = '';
    private mschDescription = '';
    private sharedCodePool: string[] = []; // For tile displays
    private isTileDisplay = false;

    private static readonly DIRECTION_LIST: Direction[] = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ];

    private static readonly SCREEN_DATA: Record<string, ScreenData> = {
        'large-logic-display': {
            size: 6,
            pos: { x: 2, y: 3 },
            linkMaxLength: 12.75,
        },
        'logic-display': {
            size: 3,
            pos: { x: 1, y: 1 },
            linkMaxLength: 11.402,
        },
        'tile-logic-display': {
            size: 1,
            pos: { x: 0, y: 0 },
            linkMaxLength: 9.89,
        },
    };

    constructor(
        screenCode: string[][],
        screenName: string,
        screenType: string,
        mschName: string,
        mschDescription: string,
        countX: number,
        countY: number
    ) {
        this.mschName = mschName;
        this.mschDescription = mschDescription;
        this.screenName = screenName;
        this.screenType = screenType;

        const screen = SchematicWriter.SCREEN_DATA[screenType];
        if (!screen) {
            throw new Error(`Unknown screen type: ${screenType}`);
        }
        const screenSize = screen.size;

        this.linkMaxLength = screen.linkMaxLength;

        // Detect tile display and use shared code pool
        this.isTileDisplay = screenType === 'tile-logic-display';
        if (this.isTileDisplay && screenCode[0]) {
            // For tile displays, all codes are in screenCode[0]
            this.sharedCodePool = [...screenCode[0]];
        }

        this.allScreenSize = {
            x: screenSize * countX,
            y: screenSize * countY,
        };

        const center = screenSize / 2 - 0.5;

        // Build screen list
        for (let y = 0; y < countY; y++) {
            for (let x = 0; x < countX; x++) {
                const index = y * countX + x;
                const codes = [...(screenCode[index] || [])];
                const blockCenter = {
                    x: center + x * screenSize,
                    y: center + y * screenSize,
                };
                const pos = {
                    x: screen.pos.x + x * screenSize,
                    y: screen.pos.y + y * screenSize,
                };
                this.screenList.push({
                    index,
                    codes,
                    center: blockCenter,
                    pos,
                });
            }
        }

        this.box = {
            minX: 0,
            minY: -1,
            maxX: this.allScreenSize.x - 1,
            maxY: this.allScreenSize.y - 1,
        };

        this.point = {
            x: -1,
            y: -1,
        };

        this.direction = 0;
    }

    private getBlockLength(): number {
        if (this.isTileDisplay) {
            return this.sharedCodePool.length;
        }
        let sum = 0;
        for (const screen of this.screenList) {
            sum += screen.codes.length;
        }
        return sum;
    }

    private haveCode(): boolean {
        return this.getBlockLength() > 0;
    }

    private async setLogicBlockPos(): Promise<boolean> {
        const BATCH_SIZE = 10; // Yield every 10 iterations for smoother performance
        let iterationCount = 0;
        let iterationsSinceLastPlacement = 0;
        const MAX_ITERATIONS = 100000; // Safety limit
        const MAX_ITERATIONS_WITHOUT_PLACEMENT = 1000; // Stop if no placement in 1000 iterations

        while (this.haveCode()) {
            // Yield to browser periodically - BEFORE processing
            iterationCount++;
            iterationsSinceLastPlacement++;

            if (iterationCount % BATCH_SIZE === 0) {
                await this.yieldToBrowser();
            }

            // Safety limit to prevent infinite loops
            if (iterationCount > MAX_ITERATIONS) {
                console.warn(`[SchematicWriter] Reached max iterations limit (${MAX_ITERATIONS})`);
                break;
            }

            // Stop if we've gone too long without finding a valid position
            if (iterationsSinceLastPlacement > MAX_ITERATIONS_WITHOUT_PLACEMENT) {
                console.warn(`[SchematicWriter] No valid positions found in ${MAX_ITERATIONS_WITHOUT_PLACEMENT} iterations, stopping. Remaining codes: ${this.getBlockLength()}`);
                break;
            }

            this.move();
            const { x, y } = this.point;

            // Check if this position overlaps with any screen
            const overlapsScreen = this.screenList.some(screen =>
                screen.pos.x === x && screen.pos.y === y
            );

            if (overlapsScreen) {
                continue; // Skip positions that overlap with screens
            }

            // Sort by distance DESCENDING (farthest first)
            const blockList = this.screenList
                .map(screen => {
                    const { center } = screen;
                    const len = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
                    return { screen, len };
                })
                .filter(item => item.len <= this.linkMaxLength)
                .sort((a, b) => b.len - a.len); // DESCENDING = farthest first

            if (blockList.length === 0) {
                // No screens in range, continue spiral
                continue;
            }

            // For tile displays: use shared pool, link to nearest screen
            // For normal displays: find screen with codes
            let target: Screen | null = null;
            let code: string | undefined;

            if (this.isTileDisplay) {
                // Tile display: take from shared pool, link to nearest
                if (this.sharedCodePool.length > 0) {
                    target = blockList[0]?.screen || null;
                    code = this.sharedCodePool.shift();
                }
            } else {
                // Normal display: find screen with codes
                for (const item of blockList) {
                    if (item.screen.codes.length > 0) {
                        target = item.screen;
                        code = target.codes.shift();
                        break;
                    }
                }
            }

            if (target === null || !code) {
                continue;
            }

            this.logicBlockList.push({
                pos: { ...this.point },
                index: target.index,
                code: code,
            });

            // Reset counter since we placed a processor
            iterationsSinceLastPlacement = 0;
        }
        return true;
    }

    private move(): void {
        const dir = SchematicWriter.DIRECTION_LIST[this.direction];
        if (!dir) return;

        let { x, y } = this.point;
        x += dir.x;
        y += dir.y;

        if (this.isOutBox(x, y)) {
            this.direction = (this.direction + 1) % 4;
            this.resetBox(x, y);
        }

        this.point = { x, y };
    }

    private isOutBox(x: number, y: number): boolean {
        const { minX, minY, maxX, maxY } = this.box;
        return x < minX || x > maxX || y < minY || y > maxY;
    }

    private resetBox(x: number, y: number): void {
        if (x < this.box.minX) this.box.minX = x;
        if (x > this.box.maxX) this.box.maxX = x;
        if (y < this.box.minY) this.box.minY = y;
        if (y > this.box.maxY) this.box.maxY = y;
    }

    private static fixPos(
        minX: number,
        _minY: number,
        _maxX: number,
        maxY: number,
        x: number,
        y: number
    ): { x: number; y: number } {
        return {
            x: x - minX,
            y: maxY - y,
        };
    }

    private async createProcessorConfig(
        code: string,
        links: Array<{ x: number; y: number; name: string }>
    ): Promise<number[]> {
        const writer = new BinaryWriter();

        // Version 1
        writer.writeByte(1);

        // Code
        const codeBytes = new TextEncoder().encode(code);
        writer.writeInt(codeBytes.length);
        const rawBuffer = writer.getRawBuffer();
        rawBuffer.push(...codeBytes);

        // Links
        writer.writeInt(links.length);
        for (const link of links) {
            writer.writeString(link.name);
            writer.writeShort(link.x);
            writer.writeShort(link.y);
        }

        // Compress
        const dataArray = writer.getBuffer();
        const compressedBuffer = await compressSchematicData(dataArray);

        return Array.from(new Uint8Array(compressedBuffer));
    }

    /**
     * Yield to browser to prevent UI freeze
     */
    private yieldToBrowser(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    async generate(onProgress?: (progress: number) => void): Promise<Blob | null> {
        console.log('[SchematicWriter] Starting position finding...');
        const startTime = Date.now();

        if (!(await this.setLogicBlockPos())) {
            return null;
        }

        console.log(`[SchematicWriter] Position finding done in ${Date.now() - startTime}ms, found ${this.logicBlockList.length} positions`);

        const writer = new BinaryWriter();
        const { minX, minY, maxX, maxY } = this.box;

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        writer.writeShort(width);
        writer.writeShort(height);

        const tags = {
            name: this.mschName,
            description: this.mschDescription,
        };

        writer.writeByte(Object.keys(tags).length);
        for (const [key, value] of Object.entries(tags)) {
            writer.writeString(key);
            writer.writeString(value);
        }

        const blockTypes = new Set<string>();
        blockTypes.add(this.screenType);
        blockTypes.add('micro-processor');

        writer.writeByte(blockTypes.size);
        for (const type of blockTypes) {
            writer.writeString(type);
        }

        const totalBlocks = this.screenList.length + this.logicBlockList.length;
        writer.writeInt(totalBlocks);

        const blockTypeArray = Array.from(blockTypes);
        const displayTypeIndex = blockTypeArray.indexOf(this.screenType);

        for (const screen of this.screenList) {
            const { x, y } = screen.pos;
            const pos = SchematicWriter.fixPos(minX, minY, maxX, maxY, x, y);

            writer.writeByte(displayTypeIndex);
            writer.writeShort(pos.x);
            writer.writeShort(pos.y);
            writer.writeByte(0);
            writer.writeByte(0);
        }

        const processorTypeIndex = blockTypeArray.indexOf('micro-processor');
        const totalProcessors = this.logicBlockList.length;
        const BATCH_SIZE = 10; // Process 10 processors at a time

        for (let i = 0; i < totalProcessors; i++) {
            const logic = this.logicBlockList[i];
            if (!logic) continue;

            const { x, y } = logic.pos;
            const pos = SchematicWriter.fixPos(minX, minY, maxX, maxY, x, y);

            writer.writeByte(processorTypeIndex);
            writer.writeShort(pos.x);
            writer.writeShort(pos.y);

            const targetScreen = this.screenList[logic.index];
            if (!targetScreen) continue;

            const screenPos = SchematicWriter.fixPos(
                minX,
                minY,
                maxX,
                maxY,
                targetScreen.pos.x,
                targetScreen.pos.y
            );

            const relX = screenPos.x - pos.x;
            const relY = screenPos.y - pos.y;

            const config = await this.createProcessorConfig(logic.code, [
                { x: relX, y: relY, name: this.screenName },
            ]);

            writer.writeByte(14);
            writer.writeInt(config.length);
            const rawBuffer = writer.getRawBuffer();
            rawBuffer.push(...config);
            writer.writeByte(0);

            // Yield to browser every BATCH_SIZE processors
            if ((i + 1) % BATCH_SIZE === 0) {
                await this.yieldToBrowser();
                onProgress?.((i + 1) / totalProcessors);
            }
        }

        onProgress?.(1); // Complete
        const dataArray = writer.getBuffer();
        return await createSchematicBlob(dataArray);
    }
}
