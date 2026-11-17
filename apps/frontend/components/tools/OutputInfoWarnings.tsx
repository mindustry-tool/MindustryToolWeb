import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Warning } from './output-info.types';

export function OutputInfoWarnings({ warnings }: { warnings: Warning[] }) {
    if (warnings.length === 0) return null;

    return (
        <div className="space-y-2">
            {warnings.map((warning, index) => (
                <Alert
                    key={index}
                    variant={warning.level === 'error' ? 'destructive' : 'default'}
                    className={
                        warning.level === 'warning'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 py-2'
                            : warning.level === 'info'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 py-2'
                                : 'py-2'
                    }
                >
                    <div className="flex items-start gap-2">
                        {warning.level === 'error' ? (
                            <XCircle className="h-4 w-4 mt-0.5" />
                        ) : warning.level === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600 dark:text-yellow-500" />
                        ) : (
                            <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-500" />
                        )}
                        <div className="flex-1">
                            <AlertTitle className="text-xs font-medium">{warning.title}</AlertTitle>
                            <AlertDescription className="text-xs mt-0.5">
                                {warning.message}
                            </AlertDescription>
                            {warning.action && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={warning.action.onClick}
                                    className="mt-1.5 h-6 text-xs"
                                >
                                    {warning.action.label}
                                </Button>
                            )}
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
}
