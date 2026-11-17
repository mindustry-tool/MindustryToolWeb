import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { DEFAULT_SETTINGS, DISPLAY_TYPES, DISPLAY_SPECS } from '../lib/constants';
import type { GeneratorSettings } from '../lib/types';
import { AdvancedSettings } from './advanced-settings';

type SettingsPanelProps = {
	settings: GeneratorSettings;
	onSettingsChange: (settings: Partial<GeneratorSettings>) => void;
	pixelCount?: number;
	processorCount?: number;
	imageFile?: File | null;
	imageWidth?: number;
	imageHeight?: number;
	showOutputInfo?: boolean;
	className?: string;
	onGenerate?: () => void;
	isProcessing?: boolean;
	canGenerate?: boolean;
	onReset?: () => void;
	children?: React.ReactNode;
};

export function SettingsPanel({
	settings,
	onSettingsChange,
	pixelCount = 0,
	processorCount = 0,
	imageFile,
	imageWidth = 0,
	imageHeight = 0,
	showOutputInfo,
	className,
	onGenerate,
	isProcessing = false,
	canGenerate = false,
	onReset,
	children,
}: SettingsPanelProps) {
	const { t } = useI18n('generator-logic-display');
	// Track which display type is selected
	const [selectedDisplayTypeIndex, setSelectedDisplayTypeIndex] = useState(() => {
		// Find matching display type
		// If screenX/Y > 4, it must be the Tiled option (maxTiling 16)
		// Otherwise prefer the standard option
		const isLargeTiling = settings.screenX > 4 || settings.screenY > 4;

		const index = DISPLAY_TYPES.findIndex((type) => {
			if (type.value !== settings.displaySize) return false;

			// If we need large tiling, only match types that support it
			if (isLargeTiling) return type.maxTiling >= 16;

			// Otherwise, prefer the one with maxTiling 4 (standard) over 16 (tiled)
			// But since findIndex returns the first match, and standard is first in array,
			// we just need to match displaySize.
			// However, we want to distinguish between "Logic Display" and "Tiled Logic Display"
			// if they have same size.
			// Actually, if we are in 80x80 and <= 4x4, we default to "Logic Display" (index 0).
			// If we want "Tiled Logic Display", the user has to select it.
			// But if we are reloading, we might lose that distinction if we only look at settings.
			// That's acceptable.
			return true;
		});
		return index >= 0 ? index : 0;
	});

	const updateSettings = (updates: Partial<GeneratorSettings>) => {
		onSettingsChange(updates);
	};

	const handleReset = () => {
		setSelectedDisplayTypeIndex(0);
		if (onReset) {
			onReset();
		} else {
			onSettingsChange(DEFAULT_SETTINGS);
		}
	};

	const handleDisplayTypeChange = (value: string) => {
		const index = parseInt(value);
		const displayType = DISPLAY_TYPES[index];

		if (displayType) {
			setSelectedDisplayTypeIndex(index);

			// Get current and new display specs
			const currentSpec = DISPLAY_SPECS[settings.displaySize];
			const newSpec = DISPLAY_SPECS[displayType.value];
			const maxTiling = displayType.maxTiling;

			// Calculate current total pixel dimensions
			const currentTotalWidth = currentSpec.width * settings.screenX;
			const currentTotalHeight = currentSpec.height * settings.screenY;

			// Calculate the aspect ratio of the current setup
			const aspectRatio = currentTotalWidth / currentTotalHeight;

			// Calculate how many new screens we need to cover similar pixel area
			// newScreenX * newSpec.width ≈ currentTotalWidth
			// newScreenY * newSpec.height ≈ currentTotalHeight
			let newScreenX = Math.max(1, Math.round(currentTotalWidth / newSpec.width));
			let newScreenY = Math.max(1, Math.round(currentTotalHeight / newSpec.height));

			// Clamp to maxTiling
			newScreenX = Math.min(newScreenX, maxTiling);
			newScreenY = Math.min(newScreenY, maxTiling);

			// If we hit the max limit, try to maintain aspect ratio within the limit
			if (newScreenX > maxTiling || newScreenY > maxTiling) {
				// Calculate which dimension is more constrained
				if (aspectRatio > 1) {
					// Width is larger, constrain by width
					newScreenX = maxTiling;
					newScreenY = Math.max(1, Math.min(Math.round(newScreenX / aspectRatio), maxTiling));
				} else {
					// Height is larger or equal, constrain by height
					newScreenY = maxTiling;
					newScreenX = Math.max(1, Math.min(Math.round(newScreenY * aspectRatio), maxTiling));
				}
			}

			updateSettings({
				displaySize: displayType.value,
				screenX: newScreenX,
				screenY: newScreenY,
			});
		}
	};

	const currentDisplayType = DISPLAY_TYPES[selectedDisplayTypeIndex];
	const maxTiling = currentDisplayType?.maxTiling ?? 1;

	return (
		<div className={cn('flex flex-col gap-6 rounded-lg border p-6 h-full', className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					<Tran text="generator-logic-display.settings" />
				</h3>
				<Button variant="outline" size="sm" onClick={handleReset}>
					<RotateCcw className="mr-2 h-4 w-4" />
					<Tran text="generator-logic-display.reset" />
				</Button>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					{/* Block */}
					<div className="space-y-2">
						<Label htmlFor="display-type">
							<Tran text="generator-logic-display.display-type" />
						</Label>
						<Select value={selectedDisplayTypeIndex.toString()} onValueChange={handleDisplayTypeChange}>
							<SelectTrigger id="display-type" className="w-full">
								<SelectValue placeholder={t('generator-logic-display.select-display-type')} />
							</SelectTrigger>
							<SelectContent>
								{DISPLAY_TYPES.map((type, index) => (
									<SelectItem key={index} value={index.toString()}>
										<div className="flex items-center gap-2">
											<div className="relative h-5 w-5 shrink-0">
												<Image src={type.imageUrl} alt={type.label} fill className="object-contain" sizes="20px" />
											</div>
											<span className="truncate">{type.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Color */}
					<div className="space-y-2">
						<Label htmlFor="compression-level">
							<Tran text="generator-logic-display.compression-level" />
						</Label>
						<Select
							value={settings.compressionLevel.toString()}
							onValueChange={(value) => updateSettings({ compressionLevel: parseInt(value) })}
						>
							<SelectTrigger id="compression-level" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[0, 1, 2, 3, 4, 5, 6, 7].map((level) => (
									<SelectItem key={level} value={level.toString()}>
										{Math.pow(2, 8 - level)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

			</div>

			{/* Screen Size (Tiling) - Always show now */}
			<div className="space-y-4">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="screen-x">
							<Tran text="generator-logic-display.screen-x" />
						</Label>
						<span className="text-sm text-muted-foreground">{settings.screenX}</span>
					</div>
					<Slider
						value={[settings.screenX]}
						onValueChange={([value]: number[]) => updateSettings({ screenX: value })}
						min={1}
						max={maxTiling}
						step={1}
						className="w-full"
					/>
				</div>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="screen-y">
							<Tran text="generator-logic-display.screen-y" />
						</Label>
						<span className="text-sm text-muted-foreground">{settings.screenY}</span>
					</div>
					<Slider
						value={[settings.screenY]}
						onValueChange={([value]: number[]) => updateSettings({ screenY: value })}
						min={1}
						max={maxTiling}
						step={1}
						className="w-full"
					/>
				</div>
			</div>

			{/* Advanced Settings */}
			<AdvancedSettings
				settings={settings}
				onSettingsChange={updateSettings}
			/>

			{/* Output Info Panel (from children) */}
			{children}

			{/* Bottom section: Generate Button */}
			<div className="mt-auto space-y-4">
				{/* Output Info */}
				{
					showOutputInfo && (
						<div className="rounded-lg border p-3 space-y-3 bg-muted/30">
							<h4 className="text-xs font-semibold text-muted-foreground">
								<Tran text="generator-logic-display.output-info" />
							</h4>

							{/* Original Image Info */}
							{imageFile && (
								<div className="space-y-1 pb-2 border-b border-border/50">
									<div className="grid grid-cols-2 gap-2 text-xs">
										<div>
											<span className="text-muted-foreground"><Tran text="generator-logic-display.original-size" />:</span>
											<span className="ml-2 font-mono">
												{imageWidth} × {imageHeight}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground"><Tran text="generator-logic-display.file-size" />:</span>
											<span className="ml-2 font-mono">
												{imageFile.size < 1024
													? `${imageFile.size} B`
													: imageFile.size < 1024 * 1024
														? `${(imageFile.size / 1024).toFixed(1)} KB`
														: `${(imageFile.size / (1024 * 1024)).toFixed(1)} MB`}
											</span>
											<span className="ml-1.5 inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
												{imageFile.name.split('.').pop()?.toUpperCase()}
											</span>
										</div>
									</div>
								</div>
							)}

							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="flex justify-start gap-1">
									<span className="text-muted-foreground">
										<Tran text="generator-logic-display.width" />:
									</span>
									<span className="font-mono">{settings.screenX} <Tran text="generator-logic-display.blocks" /></span>
								</div>
								<div className="flex justify-start gap-1">
									<span className="text-muted-foreground">
										<Tran text="generator-logic-display.height" />:
									</span>
									<span className="font-mono">{settings.screenY} <Tran text="generator-logic-display.blocks" /></span>
								</div>
								<div className="flex justify-start gap-1">
									<span className="text-muted-foreground">
										<Tran text="generator-logic-display.pixels" />:
									</span>
									<span className="font-mono">{pixelCount}</span>
								</div>
								<div className="flex justify-start gap-1">
									<span className="text-muted-foreground">
										<Tran text="generator-logic-display.logic-blocks" />:
									</span>
									<span className="font-mono">{processorCount} <Tran text="generator-logic-display.processors" /></span>
								</div>
							</div>
						</div>
					)
				}

				{/* Generate Button */}
				{
					onGenerate && (
						<Button
							onClick={onGenerate}
							disabled={!canGenerate || isProcessing}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Sparkles className="mr-2 h-4 w-4" />
							)}
							<Tran text="generator-logic-display.generate" />
						</Button>
					)
				}
			</div>
		</div >
	);
}
