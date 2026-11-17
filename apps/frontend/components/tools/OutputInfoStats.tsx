import { Tran } from '@/i18n/tran';
import { Badge } from '@/components/ui/badge';
import type { OutputInfo } from './output-info.types';
import { getFileFormat, getFormatBadgeClass } from './output-info.helpers';

export function OutputInfoStats({ info }: { info: OutputInfo }) {
    const { width, height, fileCount, sourceFile, logicDisplay, sorterCanvas } = info;
    const fileFormat = sourceFile ? getFileFormat(sourceFile.name) : null;

    return (
        <div className="space-y-3">
            {sourceFile && (
                <div className="flex items-center justify-between text-sm bg-muted/30 rounded px-2 py-1.5">
                    <span className="text-muted-foreground truncate max-w-[60%]" title={sourceFile.name}>
                        {sourceFile.name}
                    </span>
                    <div className="flex items-center gap-2">
                        {fileFormat && (
                            <Badge
                                variant="outline"
                                className={`uppercase text-[10px] px-1.5 py-0 ${getFormatBadgeClass(fileFormat)}`}
                            >
                                {fileFormat}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {sourceFile.originalWidth}×{sourceFile.originalHeight}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground"><Tran text="tools.dimensions" /></span>
                    <span className="font-medium">{width}×{height}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground"><Tran text="tools.files" /></span>
                    <span className="font-medium">{fileCount}</span>
                </div>

                {logicDisplay && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground"><Tran text="tools.screen" /></span>
                            <span className="font-medium">{logicDisplay.screenType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground"><Tran text="tools.grid" /></span>
                            <span className="font-medium">{logicDisplay.screenGridX}×{logicDisplay.screenGridY}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground"><Tran text="tools.processors" /></span>
                            <span className="font-medium">{logicDisplay.processorCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground"><Tran text="tools.instructions" /></span>
                            <span className="font-medium">~{logicDisplay.instructionCount.toLocaleString()}</span>
                        </div>
                    </>
                )}

                {sorterCanvas && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground"><Tran text="tools.block" /></span>
                            <span className="font-medium capitalize">{sorterCanvas.blockType}</span>
                        </div>
                        {sorterCanvas.materialsUsed !== undefined && sorterCanvas.materialsTotal !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground"><Tran text="tools.materials" /></span>
                                <span className="font-medium">{sorterCanvas.materialsUsed}/{sorterCanvas.materialsTotal}</span>
                            </div>
                        )}
                        {sorterCanvas.splitH && sorterCanvas.splitV && (sorterCanvas.splitH > 1 || sorterCanvas.splitV > 1) && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground"><Tran text="tools.split" /></span>
                                <span className="font-medium">{sorterCanvas.splitH}×{sorterCanvas.splitV}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
