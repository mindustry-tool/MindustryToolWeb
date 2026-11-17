import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

export type NetPowerProps = {
	powerProduction?: number | null;
	powerConsumption?: number | null;
	netPower?: number | null;
	showBreakdown?: boolean;
	className?: string;
};

export function NetPower({
	powerProduction,
	powerConsumption,
	netPower,
	showBreakdown = false,
	className,
}: NetPowerProps) {
	const prod = powerProduction ?? 0;
	const cons = powerConsumption ?? 0;
	const hasPowerData =
		powerProduction !== undefined || powerConsumption !== undefined
			? prod > 0 || cons > 0
			: netPower !== undefined && netPower !== null;

	const effectiveNet =
		netPower !== undefined && netPower !== null ? netPower : prod - cons;

	const text = (
		<span
			className={cn(
				'font-mono font-semibold',
				effectiveNet > 0
					? 'text-emerald-400'
					: effectiveNet < 0
						? 'text-amber-400'
						: 'text-muted-foreground',
				className,
			)}
		>
			{effectiveNet > 0
				? `+${Math.round(effectiveNet).toLocaleString()}/s`
				: effectiveNet < 0
					? `${Math.round(effectiveNet).toLocaleString()}/s`
					: hasPowerData
						? '0/s'
						: <Tran text="none" />}
		</span>
	);

	if (showBreakdown && prod > 0 && cons > 0) {
		return (
			<div className="inline-flex flex-col items-center">
				{text}
				<span className="text-[9px] font-mono text-muted-foreground/70">
					+{prod} / -{cons}
				</span>
			</div>
		);
	}

	return text;
}
