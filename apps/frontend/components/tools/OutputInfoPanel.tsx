import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { toast } from 'sonner';

import type {
    OutputInfo,
    OutputInfoPanelProps,
    SourceFileInfo,
    LogicDisplayInfo,
    SorterCanvasInfo,
    WarningThresholds,
    Warning,
    WarningLevel,
} from './output-info.types';
import { generateCopyText } from './output-info.helpers';
import { OutputInfoStats } from './OutputInfoStats';
import { OutputInfoWarnings } from './OutputInfoWarnings';

export type {
    OutputInfo,
    OutputInfoPanelProps,
    SourceFileInfo,
    LogicDisplayInfo,
    SorterCanvasInfo,
    WarningThresholds,
    Warning,
    WarningLevel,
};

export function OutputInfoPanel({
    info,
    thresholds,
    unit = 'tiles',
    generatorName = 'Generator',
    onAutoFix,
}: OutputInfoPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const { t } = useI18n('tools');

    const warnings: Warning[] = useMemo(() => {
        const result: Warning[] = [];

        if (info) {
            const { width, height, estimatedSizeBytes } = info;
            const { maxDimension, warnDimension = maxDimension * 0.8, maxFileSizeBytes } = thresholds;

            const maxSize = Math.max(width, height);
            if (maxSize > maxDimension) {
                result.push({
                    level: 'error',
                    title: 'Size Limit Exceeded',
                    message: `Output is ${width}×${height} ${unit} (max: ${maxDimension}×${maxDimension}).`,
                    action: onAutoFix
                        ? {
                            label: 'Auto-fix: Increase split',
                            onClick: () => {
                                const optimalSplit = Math.ceil(maxSize / maxDimension);
                                onAutoFix('increase-split', optimalSplit);
                            },
                        }
                        : undefined,
                });
            } else if (maxSize > warnDimension) {
                result.push({
                    level: 'warning',
                    title: 'Approaching Size Limit',
                    message: `Output is ${width}×${height} ${unit}. Consider reducing size.`,
                    action: onAutoFix
                        ? {
                            label: 'Suggest size reduction',
                            onClick: () => {
                                const optimalSize = Math.floor(maxDimension * 0.9);
                                onAutoFix('decrease-size', optimalSize);
                            },
                        }
                        : undefined,
                });
            }

            if (estimatedSizeBytes && maxFileSizeBytes && estimatedSizeBytes > maxFileSizeBytes) {
                const sizeMB = (estimatedSizeBytes / 1024 / 1024).toFixed(1);
                const maxMB = (maxFileSizeBytes / 1024 / 1024).toFixed(0);
                result.push({
                    level: 'info',
                    title: 'Large Download',
                    message: `Estimated ZIP size: ${sizeMB}MB (>${maxMB}MB). Download may take time.`,
                });
            }
        }

        return result;
    }, [info, thresholds, unit, onAutoFix]);

    const handleCopy = useCallback(() => {
        if (!info) return;

        const text = generateCopyText(info, generatorName, unit, warnings);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            toast.success(t('output-info-copied'));
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error(t('copy-failed'));
        });
    }, [info, generatorName, unit, warnings, t]);

    if (!info) return null;

    const hasError = warnings.some((w) => w.level === 'error');
    const hasWarning = warnings.some((w) => w.level === 'warning');
    const badgeVariant = hasError ? 'destructive' : hasWarning ? 'default' : 'secondary';

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-muted/50">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <h3 className="text-sm font-semibold"><Tran text="tools.output-info" /></h3>
                    {warnings.length > 0 && (
                        <Badge variant={badgeVariant} className="text-xs">
                            {warnings.length}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 w-7 p-0"
                    title={t('copy-info-developer')}
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {isExpanded && (
                <div className="p-3 space-y-3">
                    <OutputInfoStats info={info} />
                    <OutputInfoWarnings warnings={warnings} />
                </div>
            )}
        </div>
    );
}
