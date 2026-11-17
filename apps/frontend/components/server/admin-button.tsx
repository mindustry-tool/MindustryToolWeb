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
import { PlayerDto } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type AdminButtonProps = {
	serverId: string;
	player: PlayerDto;
};

export function AdminButton({ serverId, player }: AdminButtonProps) {
	const queryClient = useQueryClient();
	const { isOnline } = useServer(serverId);

	const { uuid, isAdmin } = player;

	const { mutate, isPending } = useMutation({
		mutationFn: (command: string) =>
			apiInstance.request(api.v4.servers.commands.send, {
				params: { id: serverId },
				body: { command: command.trim() },
			}),
		onError: (error) => {
			toast.error(String(error));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
		},
	});

	function handleAdmin() {
		if (isAdmin) {
			mutate(`admin remove ${uuid}`);
		} else {
			mutate(`admin add ${uuid}`);
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className="justify-between"
					variant={isAdmin ? 'command-destructive' : 'command'}
					disabled={!isOnline || isPending}
				>
					<Tran
						text={isAdmin ? 'server.remove-admin' : 'server.add-admin'}
					/>
					{isAdmin ? <X /> : <Plus />}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran
						text={isAdmin ? 'server.remove-admin' : 'server.add-admin'}
					/>
				</AlertDialogTitle>
				<VisuallyHidden>
					<AlertDialogDescription />
				</VisuallyHidden>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant={isAdmin ? 'destructive' : 'default'} onClick={handleAdmin}>
							<Tran
								text={isAdmin ? 'server.remove-admin' : 'server.add-admin'}
							/>
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
