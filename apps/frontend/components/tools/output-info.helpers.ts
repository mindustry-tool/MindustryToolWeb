import type { OutputInfo, Warning } from './output-info.types';

export function getFileFormat(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getFormatBadgeClass(format: string): string {
    switch (format.toLowerCase()) {
        case 'png':
            return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
        case 'jpg':
        case 'jpeg':
            return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
        case 'webp':
            return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
        case 'gif':
            return 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30';
        case 'bmp':
            return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
        default:
            return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
    }
}

export function generateCopyText(info: OutputInfo, generatorName: string, unit: string, warnings: Warning[]): string {
    const lines: string[] = [
        '=== Mindustry Tool Output Info ===',
        `Generator: ${generatorName}`,
        `Date: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`,
        '',
    ];

    if (info.sourceFile) {
        const format = getFileFormat(info.sourceFile.name);
        lines.push('Source File:');
        lines.push(`  Name: ${info.sourceFile.name}`);
        lines.push(`  Format: ${format.toUpperCase()}`);
        lines.push(`  Original Size: ${info.sourceFile.originalWidth}×${info.sourceFile.originalHeight} px`);
        if (info.sourceFile.sizeBytes) {
            lines.push(`  File Size: ${formatBytes(info.sourceFile.sizeBytes)}`);
        }
        lines.push('');
    }

    lines.push('Output:');
    lines.push(`  Dimensions: ${info.width}×${info.height} ${unit}`);
    lines.push(`  Files: ${info.fileCount}`);

    if (info.logicDisplay) {
        lines.push(`  Screen Type: ${info.logicDisplay.screenType}`);
        lines.push(`  Screen Grid: ${info.logicDisplay.screenGridX}×${info.logicDisplay.screenGridY} (${info.logicDisplay.screenGridX * info.logicDisplay.screenGridY} displays)`);
        lines.push(`  Processors: ${info.logicDisplay.processorCount}`);
        lines.push(`  Instructions: ~${info.logicDisplay.instructionCount.toLocaleString()}`);
    }

    if (info.sorterCanvas) {
        lines.push(`  Block Type: ${info.sorterCanvas.blockType}`);
        if (info.sorterCanvas.materialsUsed !== undefined && info.sorterCanvas.materialsTotal !== undefined) {
            lines.push(`  Materials: ${info.sorterCanvas.materialsUsed}/${info.sorterCanvas.materialsTotal}`);
        }
        if (info.sorterCanvas.splitH && info.sorterCanvas.splitV && (info.sorterCanvas.splitH > 1 || info.sorterCanvas.splitV > 1)) {
            lines.push(`  Split: ${info.sorterCanvas.splitH}×${info.sorterCanvas.splitV}`);
        }
    }

    if (warnings.length > 0) {
        lines.push('');
        lines.push('Warnings:');
        warnings.forEach((w) => {
            lines.push(`  - [${w.level.toUpperCase()}] ${w.title}: ${w.message}`);
        });
    }

    lines.push('');
    lines.push('URL: https://mindustry-tool.com/tools');

    return lines.join('\n');
}
