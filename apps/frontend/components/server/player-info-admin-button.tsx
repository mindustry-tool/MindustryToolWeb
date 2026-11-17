'use client';

import { Plus, X } from 'lucide-react';

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
import { api } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { PlayerInfoRecord } from './player-info-ban-button';

type PlayerInfoAdminButtonProps = {
	serverId: string;
	player: Pick<PlayerInfoRecord, 'id' | 'lastName' | 'admin'>;
};

export function PlayerInfoAdminButton({ serverId, player }: PlayerInfoAdminButtonProps) {
	const queryClient = useQueryClient();
	const { isOnline } = useServer(serverId);

	const { id, admin, lastName } = player;

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

	async function handleAdminToggle() {
		try {
			if (admin) {
				await mutateAsync(`admin remove ${id}`);
				toast.success(`Removed admin from ${lastName}`);
			} else {
				await mutateAsync(`admin add ${id}`);
				toast.success(`Added admin to ${lastName}`);
			}
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'player-infos'] });
				queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
			}, 500);
		} catch (e) {
			toast.error(String(e));
		}
	}

	const labelKey = admin ? 'server.remove-admin' : 'server.add-admin';

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className="justify-between w-full"
					variant={admin ? 'command-destructive' : 'command'}
					disabled={!isOnline || isPending}
				>
					<Tran text={labelKey} />
					{admin ? <X size={16} /> : <Plus size={16} />}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text={labelKey} />
				</AlertDialogTitle>
				<VisuallyHidden>
					<AlertDialogDescription />
				</VisuallyHidden>
				<p className="text-sm text-muted-foreground">
					Are you sure you want to {admin ? 'remove admin permissions from' : 'grant admin permissions to'}{' '}
					<strong>{lastName}</strong> (UUID: <code className="text-xs">{id}</code>)?
				</p>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant={admin ? 'destructive' : 'default'} onClick={handleAdminToggle} disabled={isPending}>
							<Tran text={labelKey} />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
