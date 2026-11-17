'use client';

import { Trash2 } from 'lucide-react';
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

type RemoveKickButtonProps = {
	serverId: string;
	ip: string;
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'command-destructive';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
};

export function RemoveKickButton({ serverId, ip, variant = 'outline', size = 'sm', className }: RemoveKickButtonProps) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.servers.kicks.remove, {
				params: { id: serverId, ip },
			}),
		onError: (error) => {
			toast.error(String(error));
		},
		onSuccess: () => {
			toast.success(`Removed kick for IP ${ip}`);
			queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'kicks'] });
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant={variant}
					size={size}
					disabled={isPending}
					className={className ?? 'gap-1.5 text-xs text-destructive hover:text-destructive'}
				>
					<Trash2 className="size-3.5" />
					<Tran text="server.remove-kick" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="server.remove-kick" />
				</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to remove the kick for IP <span className="font-mono font-semibold text-foreground">{ip}</span>?
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={() => mutate()}>
							<Tran text="remove" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
