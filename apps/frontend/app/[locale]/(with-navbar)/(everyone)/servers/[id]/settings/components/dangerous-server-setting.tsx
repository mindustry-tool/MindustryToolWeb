'use client';

import { MutateButton } from '@/components/buttons/mutate-button';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ArrowLeftRight, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DangerousServerSetting({ server }: { server: ServerDto }) {
	const { id } = server;
	const router = useRouter();

	return (
		<div className="flex flex-col gap-2 border-destructive/50 border rounded-md p-2">
			<div className="flex gap-2">
				<Tran text="server.change-owner-description" />
				<Button className="ml-auto" variant="destructive" disabled>
					<ArrowLeftRight />
					<Tran text="server.change-owner" />
				</Button>
			</div>
			<Separator />
			<div className="flex gap-2">
				<Tran text="server.delete-description" />
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button className="ml-auto" variant="destructive">
							<Trash />
							<Tran text="server.delete" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogTitle>
							<Tran text="server.delete-confirm" />
						</AlertDialogTitle>
						<VisuallyHidden>
							<AlertDialogDescription />
						</VisuallyHidden>
						<AlertDialogFooter>
							<AlertDialogCancel asChild>
								<Button variant="secondary">
									<Tran text="cancel" />
								</Button>
							</AlertDialogCancel>
							<MutateButton
								queryKey={['servers']}
								mutationKey={['servers', id]}
								mutationFn={() =>
									apiInstance.request(api.v4.servers.delete, {
										params: {
											id,
										},
									})
								}
								on={{
									onSuccess: () => router.push(routes.servers.value),
								}}
								variant="destructive"
							>
								<Tran text="server.delete" />
							</MutateButton>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
