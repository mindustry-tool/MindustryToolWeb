export interface SourceFileInfo {
    name: string;
    originalWidth: number;
    originalHeight: number;
    sizeBytes?: number;
}

export interface LogicDisplayInfo {
    screenType: string;
    screenGridX: number;
    screenGridY: number;
    processorCount: number;
    instructionCount: number;
}

export interface SorterCanvasInfo {
    blockType: string;
    materialsUsed?: number;
    materialsTotal?: number;
    splitH?: number;
    splitV?: number;
}

export interface OutputInfo {
    width: number;
    height: number;
    fileCount: number;
    estimatedSizeBytes?: number;
    sourceFile?: SourceFileInfo;
    logicDisplay?: LogicDisplayInfo;
    sorterCanvas?: SorterCanvasInfo;
}

export interface WarningThresholds {
    maxDimension: number;
    warnDimension?: number;
    maxFileSizeBytes?: number;
}

export type WarningLevel = 'info' | 'warning' | 'error';

export interface Warning {
    level: WarningLevel;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface OutputInfoPanelProps {
    info: OutputInfo | null;
    thresholds: WarningThresholds;
    unit?: string;
    generatorName?: string;
    onAutoFix?: (action: 'increase-split' | 'decrease-size', value: number) => void;
}
