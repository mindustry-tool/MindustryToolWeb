'use client';

import { useMemo, useState } from 'react';
import {
	Check,
	Copy,
	GavelIcon,
	MessageSquare,
	ShieldAlert,
	Terminal,
	Timer,
} from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import ColorText from '@/components/common/color-text';
import { Badge } from '@/components/ui/badge';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { api } from '@mindustry-tool/api';
import { PlayerDto } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';

type DurationUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

const UNIT_MULTIPLIERS: Record<DurationUnit, number> = {
	seconds: 1000,
	minutes: 60 * 1000,
	hours: 60 * 60 * 1000,
	days: 24 * 60 * 60 * 1000,
	weeks: 7 * 24 * 60 * 60 * 1000,
};

const DURATION_PRESETS: Array<{ label: string; value: number; unit: DurationUnit }> = [
	{ label: '1m', value: 1, unit: 'minutes' },
	{ label: '5m', value: 5, unit: 'minutes' },
	{ label: '15m', value: 15, unit: 'minutes' },
	{ label: '30m', value: 30, unit: 'minutes' },
	{ label: '1h', value: 1, unit: 'hours' },
	{ label: '1d', value: 1, unit: 'days' },
	{ label: '7d', value: 7, unit: 'days' },
];

const REASON_PRESETS = [
	{ key: 'server.preset-griefing', value: 'Griefing' },
	{ key: 'server.preset-toxic-trolling', value: 'Toxic / Trolling' },
	{ key: 'server.preset-spamming', value: 'Spamming' },
	{ key: 'server.preset-afk-inactive', value: 'AFK / Inactive' },
	{ key: 'server.preset-rule-violation', value: 'Rule Violation' },
];

type KickButtonProps = {
	serverId: string;
	player: Partial<PlayerDto> & { id?: string; lastName?: string };
};

export function KickButton({ serverId, player }: KickButtonProps) {
	const queryClient = useQueryClient();
	const { isOnline } = useServer(serverId);

	const [open, setOpen] = useState(false);
	const [durationValue, setDurationValue] = useState<number | string>(15);
	const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes');
	const [reason, setReason] = useState('');
	const [copiedUuid, setCopiedUuid] = useState(false);

	const { t } = useI18n('server');

	const targetUuid = player.uuid || player.id || '';
	const playerName = player.name || player.lastName || '';

	const { mutate, isPending } = useMutation({
		mutationFn: (command: string) =>
			apiInstance.request(api.v4.servers.commands.send, {
				params: { id: serverId },
				body: { command: command.trim() },
			}),
		onSuccess: () => {
			toast.success(t('player-kicked-success'));
			setOpen(false);
			setReason('');
		},
		onError: (error) => {
			toast.error(String(error));
		},
		onSettled: () => {
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['players'] });
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'players'] });
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'recent-players'] });
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'kicks'] });
			}, 500);
		},
	});

	const numericDuration = Number(durationValue);
	const currentMs =
		!isNaN(numericDuration) && numericDuration > 0
			? Math.round(numericDuration * UNIT_MULTIPLIERS[durationUnit])
			: 0;

	const generatedCommand = useMemo(() => {
		if (!targetUuid || currentMs <= 0) return '';
		const reasonTrimmed = reason.trim();
		return reasonTrimmed
			? `kickWithReason ${targetUuid} ${currentMs} ${reasonTrimmed}`
			: `kickWithReason ${targetUuid} ${currentMs}`;
	}, [targetUuid, currentMs, reason]);

	function handleKick() {
		if (!targetUuid) {
			toast.error(t('kick-uuid-required'));
			return;
		}

		if (isNaN(numericDuration) || numericDuration <= 0) {
			toast.error(t('kick-invalid-duration'));
			return;
		}

		mutate(generatedCommand);
	}

	const handleCopyUuid = () => {
		if (!targetUuid) return;
		navigator.clipboard.writeText(targetUuid);
		setCopiedUuid(true);
		toast.success(t('player-uuid-copied'));
		setTimeout(() => setCopiedUuid(false), 1500);
	};

	const unitShortSuffix =
		durationUnit === 'minutes'
			? 'm'
			: durationUnit === 'hours'
				? 'h'
				: durationUnit === 'days'
					? 'd'
					: durationUnit === 'weeks'
						? 'w'
						: 's';

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="justify-between" variant="command-destructive" disabled={!isOnline || isPending}>
					<Tran text="server.kick" />
					<GavelIcon size={20} />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md bg-card border shadow-xl">
				<DialogHeader className="space-y-1.5 text-left">
					<div className="flex items-center gap-2">
						<div className="size-8 rounded-lg bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shrink-0">
							<ShieldAlert className="size-4" />
						</div>
						<div>
							<DialogTitle className="text-base font-semibold">
								<Tran text="server.kick" />
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								Temporarily disconnect and timeout player from the server.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-1">
					{/* Target telemetry card */}
					<div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-1.5 min-w-0">
								<span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
									Target
								</span>
								<span className="font-semibold text-sm text-foreground truncate">
									<ColorText text={playerName || 'Unknown Player'} />
								</span>
							</div>
							<Badge variant="outline" className="text-[10px] font-mono shrink-0">
								Active
							</Badge>
						</div>

						{targetUuid && (
							<div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs font-mono text-muted-foreground">
								<span className="truncate text-[11px]">UUID: {targetUuid}</span>
								<button
									type="button"
									onClick={handleCopyUuid}
									className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
									title={t('copy-uuid')}
								>
									{copiedUuid ? (
										<Check className="size-3 text-emerald-500" />
									) : (
										<Copy className="size-3" />
									)}
								</button>
							</div>
						)}
					</div>

					{/* Duration picker */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label className="text-xs font-medium flex items-center gap-1.5">
								<Timer className="size-3.5 text-muted-foreground" />
								<Tran text="duration" />
							</Label>
							{currentMs > 0 && (
								<span className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/40">
									{currentMs.toLocaleString()} ms
								</span>
							)}
						</div>

						{/* Quick Presets */}
						<div className="grid grid-cols-7 gap-1">
							{DURATION_PRESETS.map((preset) => {
								const isSelected =
									Number(durationValue) === preset.value && durationUnit === preset.unit;
								return (
									<button
										key={preset.label}
										type="button"
										onClick={() => {
											setDurationValue(preset.value);
											setDurationUnit(preset.unit);
										}}
										className={`h-7 rounded-md text-xs font-mono font-medium transition-all border ${
											isSelected
												? 'bg-destructive/15 border-destructive/40 text-destructive font-bold shadow-xs'
												: 'bg-muted/30 border-transparent hover:bg-muted/70 text-muted-foreground hover:text-foreground'
										}`}
									>
										{preset.label}
									</button>
								);
							})}
						</div>

						{/* Numeric input & unit dropdown */}
						<div className="flex gap-2 items-center">
							<Input
								type="number"
								min={1}
								value={durationValue}
								onChange={(e) => {
									const val = e.target.value;
									setDurationValue(val === '' ? '' : Math.max(1, Number(val)));
								}}
								className="w-28 text-sm font-mono"
								placeholder={t('amount-placeholder')}
							/>
							<Select
								value={durationUnit}
								onValueChange={(val: DurationUnit) => setDurationUnit(val)}
							>
								<SelectTrigger className="flex-1 text-sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
								<SelectItem value="seconds"><Tran text="server.seconds" /></SelectItem>
								<SelectItem value="minutes"><Tran text="server.minutes" /></SelectItem>
								<SelectItem value="hours"><Tran text="server.hours" /></SelectItem>
								<SelectItem value="days"><Tran text="server.days" /></SelectItem>
								<SelectItem value="weeks"><Tran text="server.weeks" /></SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Reason input with quick tags */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="kick-reason" className="text-xs font-medium flex items-center gap-1.5">
								<MessageSquare className="size-3.5 text-muted-foreground" />
								<Tran text="reason" />
							</Label>
							<span className="text-[10px] text-muted-foreground">(optional)</span>
						</div>

						{/* Preset reason tags */}
						<div className="flex flex-wrap gap-1">
							{REASON_PRESETS.map((preset) => {
								const isCurrent = reason === preset.value;
								return (
									<button
										key={preset.key}
										type="button"
										onClick={() => setReason(isCurrent ? '' : preset.value)}
										className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
											isCurrent
												? 'bg-primary/15 border-primary/40 text-primary font-medium'
												: 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
										}`}
									>
										<Tran text={preset.key as any} />
									</button>
								);
							})}
						</div>

						<Input
							id="kick-reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={t('kick-reason-placeholder')}
							className="text-sm"
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleKick();
								}
							}}
						/>
					</div>

					{/* Command preview console strip */}
					{generatedCommand && (
						<div className="flex flex-col gap-1 p-2 rounded-md bg-black/40 border border-border/40 font-mono text-[11px] text-muted-foreground">
							<div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground/70 tracking-wider">
								<Terminal className="size-3" />
								<span><Tran text="server.console-execution" /></span>
							</div>
							<div className="text-foreground/90 truncate select-all">
								<span className="text-destructive font-bold">&gt; </span>
								<span>{generatedCommand}</span>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="pt-2 border-t">
					<Button variant="outline" type="button" onClick={() => setOpen(false)}>
						<Tran text="cancel" />
					</Button>
					<Button
						variant="destructive"
						type="button"
						onClick={handleKick}
						disabled={isPending || !durationValue || Number(durationValue) <= 0 || !targetUuid}
						className="gap-1.5 font-semibold"
					>
						<GavelIcon className="size-4" />
						{isPending ? (
							<Tran text="kicking" />
						) : currentMs > 0 && durationValue ? (
							<span>
								Kick ({durationValue}
								{unitShortSuffix})
							</span>
						) : (
							<Tran text="server.kick" />
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

