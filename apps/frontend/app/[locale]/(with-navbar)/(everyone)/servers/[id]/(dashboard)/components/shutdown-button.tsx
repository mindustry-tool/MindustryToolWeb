'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import LoadingSpinner from '@/components/spinner/loading-spinner';

export default function ShutdownButton({ server }: { server: Pick<ServerDto, 'id'> }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const { id } = server;
	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.servers.remove, {
				params: {
					id,
				},
			}),
		onError: (error) => {
			toast.error(String(error));
		},
		onSettled: () => {
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['servers'] });
				router.refresh();
				setOpen(false);
			}, 2000);
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					{isPending ? <LoadingSpinner /> : <Tran text="server.shutdown" />}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="server.shutdown" />
				</AlertDialogTitle>
				<VisuallyHidden>
					<AlertDialogDescription />
				</VisuallyHidden>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
							<Tran text="server.shutdown" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
