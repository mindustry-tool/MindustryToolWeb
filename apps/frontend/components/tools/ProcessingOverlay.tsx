import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { WorkerProgressStep } from '@/lib/image-processing/worker';

interface ProcessingOverlayProps {
    isVisible: boolean;
    progress: number; // 0-100
    currentStep: WorkerProgressStep | null;
    stepMessage?: string | null;
    onCancel?: () => void;
}

const STEP_LABELS: Record<WorkerProgressStep, string> = {
    resize: 'Resizing image',
    'map-colors': 'Mapping colors',
    dithering: 'Applying dithering',
    complete: 'Complete',
};

export function ProcessingOverlay({
    isVisible,
    progress,
    currentStep,
    stepMessage,
    onCancel,
}: ProcessingOverlayProps) {
    if (!isVisible) return null;

    const stepLabel = currentStep ? STEP_LABELS[currentStep] : 'Processing';

    return (
        <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
                {/* Spinner */}
                <div className="flex justify-center mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>

                {/* Step label */}
                <p className="text-center text-sm font-medium mb-1">{stepLabel}</p>

                {/* Step message */}
                {stepMessage && (
                    <p className="text-center text-xs text-muted-foreground mb-4">
                        {stepMessage}
                    </p>
                )}

                {/* Progress bar */}
                <Progress value={progress} className="h-2 mb-4" />

                {/* Progress percentage */}
                <p className="text-center text-xs text-muted-foreground mb-4">
                    {Math.round(progress)}%
                </p>

                {/* Cancel button */}
                {onCancel && (
                    <div className="flex justify-center">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onCancel}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
