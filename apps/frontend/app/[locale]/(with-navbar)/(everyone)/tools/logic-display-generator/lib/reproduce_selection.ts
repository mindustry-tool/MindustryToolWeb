
class SchematicWriter {
    static readonly PROCESSOR_TYPES = [
        { name: 'micro-processor', range: 10, size: 1 },
        { name: 'logic-processor', range: 22, size: 2 },
        { name: 'hyper-processor', range: 40, size: 2 },
    ];

    static calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    static testSelection(screenX: number, screenY: number) {

        const displayBlockSize = 3;

        const allScreenSizeX = screenX * displayBlockSize;
        const allScreenSizeY = screenY * displayBlockSize;

        const centerX = allScreenSizeX / 2;
        const centerY = allScreenSizeY / 2;

        console.log(`Grid: ${screenX}x${screenY}`);
        console.log(`Size: ${allScreenSizeX}x${allScreenSizeY}`);
        console.log(`Center: ${centerX}, ${centerY}`);

        let maxDist = 0;
        // Simulate displays
        for (let ty = 0; ty < screenY; ty++) {
            for (let tx = 0; tx < screenX; tx++) {
                const dispX = tx * displayBlockSize;
                const dispY = ty * displayBlockSize;
                const center = displayBlockSize / 2 - 0.5;
                const cX = dispX + center;
                const cY = dispY + center;

                const dist = this.calculateDistance(centerX, centerY, cX, cY);
                if (dist > maxDist) maxDist = dist;
            }
        }

        const safetyBuffer = Math.max(2, Math.min(screenX, screenY));
        const requiredRange = maxDist + safetyBuffer;

        console.log(`MaxDist: ${maxDist.toFixed(2)}`);
        console.log(`SafetyBuffer: ${safetyBuffer}`);
        console.log(`RequiredRange: ${requiredRange.toFixed(2)}`);

        let selected = null;
        for (const proc of this.PROCESSOR_TYPES) {
            if (requiredRange <= proc.range) {
                selected = proc;
                break;
            }
        }
        if (!selected) selected = this.PROCESSOR_TYPES[this.PROCESSOR_TYPES.length - 1]!;

        console.log(`Selected: ${selected.name} (Range: ${selected.range})`);
        console.log('---');
    }
}

SchematicWriter.testSelection(4, 4);
SchematicWriter.testSelection(3, 3);
SchematicWriter.testSelection(5, 5);
