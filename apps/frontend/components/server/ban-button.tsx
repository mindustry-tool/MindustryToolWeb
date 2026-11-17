'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, GavelIcon, MessageSquare, ShieldAlert, Terminal } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import ColorText from '@/components/common/color-text';
import { Badge } from '@/components/ui/badge';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { Tran, type I18nKey } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { api } from '@mindustry-tool/api';
import { PlayerDto } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';

const BAN_REASON_PRESETS: Array<{ key: I18nKey; value: string }> = [
	{ key: 'server.preset-griefing', value: 'Griefing' },
	{ key: 'server.preset-toxic-trolling', value: 'Toxic / Trolling' },
	{ key: 'server.preset-hacking-exploiting', value: 'Hacking / Exploiting' },
	{ key: 'server.preset-spamming', value: 'Spamming' },
	{ key: 'server.preset-rule-violation', value: 'Rule Violation' },
];

export type BanPlayerTarget = Partial<PlayerDto> & {
	id?: string;
	lastName?: string;
	lastIP?: string;
};

export type BanButtonProps = {
	serverId: string;
	player: BanPlayerTarget;
	variant?: 'command-destructive' | 'destructive' | 'outline' | 'default';
	className?: string;
};

export function BanButton({ serverId, player, variant = 'command-destructive', className }: BanButtonProps) {
	const queryClient = useQueryClient();
	const { isOnline } = useServer(serverId);

	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('');
	const [banIp, setBanIp] = useState(true);
	const [copiedUuid, setCopiedUuid] = useState(false);

	const { t } = useI18n('server');

	const targetUuid = player.uuid || player.id || '';
	const playerName = player.name || player.lastName || '';
	const targetIp = player.ip || player.lastIP || '';

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (commands: string[]) => {
			for (const command of commands) {
				await apiInstance.request(api.v4.servers.commands.send, {
					params: { id: serverId },
					body: { command: command.trim() },
				});
			}
		},
		onSuccess: () => {
			toast.success(t('player-banned-success'));
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
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'player-infos'] });
			}, 500);
		},
	});

	const reasonTrimmed = reason.trim();

	const generatedCommands = useMemo(() => {
		if (!targetUuid || !reasonTrimmed) return [];
		const cmds: string[] = [`ban id ${targetUuid} ${reasonTrimmed}`];
		if (targetIp && banIp) {
			cmds.push(`ban ip ${targetIp} ${reasonTrimmed}`);
		}
		return cmds;
	}, [targetUuid, targetIp, banIp, reasonTrimmed]);

	function handleBan() {
		if (!targetUuid) {
			toast.error(t('ban-uuid-required'));
			return;
		}

		if (!reasonTrimmed) {
			toast.error(t('ban-reason-required'));
			return;
		}

		if (generatedCommands.length === 0) return;

		mutateAsync(generatedCommands);
	}

	const handleCopyUuid = () => {
		if (!targetUuid) return;
		navigator.clipboard.writeText(targetUuid);
		setCopiedUuid(true);
		toast.success(t('player-uuid-copied'));
		setTimeout(() => setCopiedUuid(false), 1500);
	};

	const iconSize = variant === 'destructive' ? 16 : 20;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className={className || 'justify-between'}
					variant={variant}
					disabled={!isOnline || isPending}
				>
					<Tran text="ban" />
					<GavelIcon size={iconSize} />
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
								<Tran text="ban" />
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								<Tran text="server.ban-dialog-desc" />
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
									<Tran text="target" />
								</span>
								<span className="font-semibold text-sm text-foreground truncate">
									<ColorText text={playerName || 'Unknown Player'} />
								</span>
							</div>
							<Badge variant="outline" className="text-[10px] font-mono shrink-0">
								<Tran text="active" />
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

					{/* Optional IP ban toggle */}
					{targetIp && (
						<div className="flex items-center space-x-2 px-1">
							<Checkbox
								id="ban-also-ip"
								checked={banIp}
								onCheckedChange={(checked) => setBanIp(Boolean(checked))}
							/>
							<Label
								htmlFor="ban-also-ip"
								className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
							>
								<Tran text="server.ban-also-ip" /> ({targetIp})
							</Label>
						</div>
					)}

					{/* Reason input with quick tags */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="ban-reason" className="text-xs font-medium flex items-center gap-1.5">
								<MessageSquare className="size-3.5 text-muted-foreground" />
								<Tran text="server.reason" />
							</Label>
							<span className="text-[10px] text-destructive font-medium">
								<Tran text="server.reason-required" />
							</span>
						</div>

						{/* Preset reason tags */}
						<div className="flex flex-wrap gap-1">
							{BAN_REASON_PRESETS.map((preset) => {
								const isCurrent = reason === preset.value;
								return (
									<button
										key={preset.key}
										type="button"
										onClick={() => setReason(isCurrent ? '' : preset.value)}
										className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
											isCurrent
												? 'bg-destructive/15 border-destructive/40 text-destructive font-medium'
												: 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
										}`}
									>
										<Tran text={preset.key} />
									</button>
								);
							})}
						</div>

						<Input
							id="ban-reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={t('ban-reason-placeholder')}
							className="text-sm"
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									if (reasonTrimmed && targetUuid) {
										handleBan();
									}
								}
							}}
						/>
					</div>

					{/* Command preview console strip */}
					{generatedCommands.length > 0 && (
						<div className="flex flex-col gap-1 p-2 rounded-md bg-black/40 border border-border/40 font-mono text-[11px] text-muted-foreground">
							<div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground/70 tracking-wider">
								<Terminal className="size-3" />
								<span>
									<Tran text="server.console-execution" />
								</span>
							</div>
							{generatedCommands.map((cmd) => (
								<div key={cmd} className="text-foreground/90 truncate select-all">
									<span className="text-destructive font-bold">&gt; </span>
									<span>{cmd}</span>
								</div>
							))}
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
						onClick={handleBan}
						disabled={isPending || !reasonTrimmed || !targetUuid}
						className="gap-1.5 font-semibold"
					>
						<GavelIcon className="size-4" />
						{isPending ? <Tran text="server.banning" /> : <Tran text="ban" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
