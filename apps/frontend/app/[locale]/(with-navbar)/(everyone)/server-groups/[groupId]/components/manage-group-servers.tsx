'use client';

import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import ColorText from '@/components/common/color-text';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { ApiItem } from '@/components/query/api-item';

export function ManageGroupServers({ groupId }: { groupId: string }) {
	const queryClient = useQueryClient();

	const { mutate: unassignServer } = useMutation({
		mutationFn: (serverId: string) =>
			apiInstance.request(api.v4.serverGroups.servers.unassign, { params: { groupId, serverId } }),
		onSuccess: (_data, serverId) => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
			toast.success(<Tran text="success" />);
		},
		onError: (error: any) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h3 className="text-lg font-semibold">
					<Tran text="servers" />
				</h3>
				<AssignServerDialog groupId={groupId} />
			</div>

			<ApiItem
				route={api.v4.serverGroups.servers.list}
				queryKey={['server-groups', groupId, 'servers']}
				params={{ groupId }}
				loading={() => (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-10 w-full rounded-md" />
						<Skeleton className="h-10 w-full rounded-md" />
					</div>
				)}
				empty={() => (
					<div className="text-center text-muted-foreground py-4">
						<Tran text="no-servers-in-group" />
					</div>
				)}
			>
				{(items: any[]) =>
					items.map((server: any) => (
						<div key={server.id} className="flex items-center gap-2 rounded-md border bg-card/50 p-2">
							<LocalLink
								href={routes.servers.id({ id: server.id }).value}
								className="flex-1 font-semibold hover:underline"
							>
								<ColorText text={server.name} />
							</LocalLink>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="ghost" size="sm" className="text-destructive">
										<Tran text="unassign" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogTitle>
										<Tran text="unassign-server" />
									</AlertDialogTitle>
									<VisuallyHidden>
										<AlertDialogDescription />
									</VisuallyHidden>
									<AlertDialogFooter>
										<AlertDialogCancel asChild>
											<Button variant="outline">
												<Tran text="cancel" />
											</Button>
										</AlertDialogCancel>
										<Button variant="destructive" onClick={() => unassignServer(server.id)}>
											<Tran text="unassign" />
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					))
				}
			</ApiItem>
		</div>
	);
}

function AssignServerDialog({ groupId }: { groupId: string }) {
	const queryClient = useQueryClient();

	const { mutate: assignServer, isPending } = useMutation({
		mutationFn: (serverId: string) =>
			apiInstance.request(api.v4.serverGroups.servers.assign, { params: { groupId }, body: { serverId } }),
		onSuccess: (_data, serverId) => {
			queryClient.invalidateQueries({ queryKey: ['server-groups', groupId] });
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
			toast.success(<Tran text="success" />);
		},
		onError: (error: any) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-fit ml-auto" variant="secondary">
					<Tran text="assign-server" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="assign-server" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
					<ApiItem
						route={api.v4.servers.findMyServer}
						queryKey={['servers', 'my']}
						query={{ page: 0, size: 100 }}
					>
						{(items: any[]) =>
							items.map((server: any) => (
								<Button
									key={server.id}
									variant="outline"
									className="w-full justify-start"
									onClick={() => assignServer(server.id)}
									disabled={isPending}
								>
									<ColorText text={server.name} />
								</Button>
							))
						}
					</ApiItem>
				</div>
			</DialogContent>
		</Dialog>
	);
}
