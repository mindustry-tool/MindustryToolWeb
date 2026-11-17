'use client';

import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import type { ParsedCommand } from './tokenize-command';
import { cn } from '@/lib/utils';
import { Tran } from '@/i18n/tran';

export interface CommandSignatureProps {
	parsed: ParsedCommand;
	onParamClick?: (index: number) => void;
}

export function CommandSignature({ parsed, onParamClick }: CommandSignatureProps) {
	const commandDef = parsed.commandDef;
	if (!parsed.isSlashCommand || !commandDef) {
		return null;
	}

	return (
		<div className="flex flex-col gap-1 px-3 py-2 bg-secondary/80 backdrop-blur-md border-b text-xs">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center flex-wrap gap-1.5 font-mono">
					<span className="font-bold text-foreground">/{commandDef.text}</span>
					{commandDef.params.length === 0 ? (
						<span className="text-muted-foreground italic">(no arguments)</span>
					) : (
						commandDef.params.map((param, index) => {
							const isActive = index === parsed.activeParamIndex;
							const formatted = `${param.optional ? '[' : '<'}${param.name}${param.variadic ? '...' : ''}${param.optional ? ']' : '>'}`;

							return (
								<button
									key={index}
									type="button"
									onClick={() => onParamClick?.(index)}
									className={cn(
										'transition-colors rounded px-1.5 py-0.5 text-xs font-mono cursor-pointer',
										isActive
											? 'bg-primary text-primary-foreground font-semibold shadow-sm'
											: param.optional
												? 'text-muted-foreground bg-muted/50'
												: 'text-foreground bg-muted',
									)}
								>
									{formatted}
								</button>
							);
						})
					)}
				</div>

				{/* Validation Status Indicator */}
				<div className="flex items-center gap-1 shrink-0">
					{parsed.validationStatus === 'valid' && (
						<span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
							<CheckCircle2 className="size-3.5" />
							<span><Tran text="active" /></span>
						</span>
					)}
					{parsed.validationStatus === 'fewArguments' && (
						<span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
							<AlertTriangle className="size-3.5" />
							<span>
								Missing {parsed.missingParam ? `<${parsed.missingParam.name}>` : 'arguments'}
							</span>
						</span>
					)}
					{parsed.validationStatus === 'manyArguments' && (
						<span className="flex items-center gap-1 text-xs text-destructive font-medium">
							<AlertCircle className="size-3.5" />
							<span>Too many arguments</span>
						</span>
					)}
				</div>
			</div>

			{commandDef.description && (
				<p className="text-muted-foreground text-[11px] line-clamp-1">{commandDef.description}</p>
			)}
		</div>
	);
}
