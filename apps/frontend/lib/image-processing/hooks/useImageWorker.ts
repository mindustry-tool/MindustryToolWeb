import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    WorkerJob,
    WorkerResponse,
    WorkerProgressStep,
} from '../worker';
import type { MindustryMaterial, PixelGrid } from '@/lib/tools';
import type { DitheringSettings } from '../dithering/types';

export interface UseImageWorkerOptions {
    debounceMs?: number; // Debounce delay before processing (default: 500ms)
}

export interface ImageWorkerResult {
    grid: PixelGrid;
    previewData: ImageData;
    stats: {
        width: number;
        height: number;
        pixelCount: number;
    };
}

export interface UseImageWorkerReturn {
    processImage: (
        imageData: ImageData,
        settings: {
            materials: MindustryMaterial[];
            dithering: boolean;
            advancedDithering?: boolean;
            advancedDitheringSettings?: DitheringSettings;
            blockSize?: number;
            sharpen?: boolean;
            sharpenStrength?: number;
        },
    ) => void;
    cancel: () => void;
    isProcessing: boolean;
    progress: number; // 0-100
    currentStep: WorkerProgressStep | null;
    stepMessage: string | null;
    result: ImageWorkerResult | null;
    error: string | null;
}

export function useImageWorker(options: UseImageWorkerOptions = {}): UseImageWorkerReturn {
    const { debounceMs = 500 } = options;

    const workerRef = useRef<Worker | null>(null);
    const currentJobIdRef = useRef<string | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<WorkerProgressStep | null>(null);
    const [stepMessage, setStepMessage] = useState<string | null>(null);
    const [result, setResult] = useState<ImageWorkerResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize worker
    useEffect(() => {
        // Create worker from file
        workerRef.current = new Worker(new URL('../worker.ts', import.meta.url));

        // Handle worker messages
        workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
            const response = event.data;

            // Ignore responses from cancelled jobs
            if (response.jobId !== currentJobIdRef.current) {
                return;
            }

            switch (response.type) {
                case 'progress':
                    setProgress(response.progress);
                    setCurrentStep(response.step);
                    if (response.message) {
                        setStepMessage(response.message);
                    }
                    break;

                case 'complete':
                    setProgress(100);
                    setCurrentStep('complete');
                    setStepMessage('Complete!');
                    setResult({
                        grid: response.grid,
                        previewData: response.previewData,
                        stats: response.stats,
                    });
                    setIsProcessing(false);
                    currentJobIdRef.current = null;
                    break;

                case 'error':
                    setError(response.error);
                    setIsProcessing(false);
                    setProgress(0);
                    setCurrentStep(null);
                    currentJobIdRef.current = null;
                    break;
            }
        };

        // Handle worker errors
        workerRef.current.onerror = (event) => {
            console.error('Worker error:', event);
            setError('Worker crashed: ' + event.message);
            setIsProcessing(false);
            setProgress(0);
            setCurrentStep(null);
            currentJobIdRef.current = null;
        };

        // Cleanup on unmount
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Cancel current job
    const cancel = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        currentJobIdRef.current = null;
        setIsProcessing(false);
        setProgress(0);
        setCurrentStep(null);
        setStepMessage(null);
        setError(null);
    }, []);

    // Process image (with debouncing)
    const processImage = useCallback(
        (
            imageData: ImageData,
            settings: {
                materials: MindustryMaterial[];
                dithering: boolean;
                advancedDithering?: boolean;
                advancedDitheringSettings?: DitheringSettings;
                blockSize?: number;
                sharpen?: boolean;
                sharpenStrength?: number;
            },
        ) => {
            // Clear previous debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Cancel current job
            cancel();

            // Reset state
            setResult(null);
            setError(null);

            // Debounce the processing
            debounceTimerRef.current = setTimeout(() => {
                if (!workerRef.current) {
                    setError('Worker not initialized');
                    return;
                }

                // Generate unique job ID
                const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                currentJobIdRef.current = jobId;

                // Start processing
                setIsProcessing(true);
                setProgress(0);
                setCurrentStep('resize');
                setStepMessage('Starting...');

                const job: WorkerJob = {
                    type: 'generateGrid',
                    jobId,
                    imageData,
                    settings,
                };

                workerRef.current.postMessage(job);
            }, debounceMs);
        },
        [debounceMs, cancel],
    );

    return {
        processImage,
        cancel,
        isProcessing,
        progress,
        currentStep,
        stepMessage,
        result,
        error,
    };
}
