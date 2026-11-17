'use client';

import { ShieldCheck } from 'lucide-react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { api } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { PlayerInfoRecord } from './player-info-ban-button';

type PlayerInfoUnbanButtonProps = {
	serverId: string;
	player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'lastIP' | 'ips'>;
};

export function PlayerInfoUnbanButton({ serverId, player }: PlayerInfoUnbanButtonProps) {
	const queryClient = useQueryClient();
	const { isOnline } = useServer(serverId);

	const { id, lastIP, lastName, ips } = player;

	const { t } = useI18n('server');

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (command: string) =>
			apiInstance.request(api.v4.servers.commands.send, {
				params: { id: serverId },
				body: { command: command.trim() },
			}),
		onError: (error) => {
			toast.error(String(error));
		},
	});

	async function handleUnban() {
		try {
			if (id) {
				await mutateAsync(`unban ${id}`);
			}
			const ipsToUnban = new Set<string>();
			if (lastIP) {
				ipsToUnban.add(lastIP);
			}
			if (ips && Array.isArray(ips)) {
				for (const ip of ips) {
					if (ip) ipsToUnban.add(ip);
				}
			}
			for (const ip of ipsToUnban) {
				await mutateAsync(`unban ${ip}`);
			}
			toast.success(t('player-unbanned-success'));
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'player-infos'] });
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'players'] });
			}, 500);
		} catch (e) {
			toast.error(String(e));
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="justify-between w-full" variant="outline" disabled={!isOnline || isPending}>
					<Tran text="unban" />
					<ShieldCheck size={16} />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="unban" />
				</AlertDialogTitle>
				<VisuallyHidden>
					<AlertDialogDescription />
				</VisuallyHidden>
				<p className="text-sm text-muted-foreground">
					Are you sure you want to unban <strong>{lastName}</strong> (UUID: <code className="text-xs">{id}</code>)?
				</p>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="default" onClick={handleUnban} disabled={isPending}>
							<Tran text="unban" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
