'use client';

import { api } from '@mindustry-tool/api';
import { ServerDto, ServerGroupDto } from '@mindustry-tool/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ColorText from '@/components/common/color-text';
import { LocalLink } from '@/components/common/locale-link';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

export function ServerGroupInfo({ server }: { server: ServerDto }) {
	const queryClient = useQueryClient();

	const { data: group } = useQuery({
		queryKey: ['server-groups', server.groupId],
		queryFn: () =>
			apiInstance.request(api.v4.serverGroups.get, { params: { groupId: server.groupId! } }),
		enabled: !!server.groupId,
	});

	const { data: myGroups = [] } = useQuery({
		queryKey: ['server-groups'],
		queryFn: () => apiInstance.request(api.v4.serverGroups.list, {}),
	});

	const { mutate: assignToGroup, isPending: isAssigning } = useMutation({
		mutationFn: (newGroupId: string) =>
			apiInstance.request(api.v4.serverGroups.servers.assign, {
				params: { groupId: newGroupId },
				body: { serverId: server.id },
			}),
		onSuccess: (_data, newGroupId) => {
			queryClient.invalidateQueries({ queryKey: ['servers', server.id] });
			queryClient.invalidateQueries({ queryKey: ['server-groups'] });
			if (server.groupId) {
				queryClient.invalidateQueries({ queryKey: ['server-groups', server.groupId] });
			}
			queryClient.invalidateQueries({ queryKey: ['server-groups', newGroupId] });
			toast.success(<Tran text="success" />);
		},
		onError: (error: Error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	const { mutate: unassignFromGroup, isPending: isUnassigning } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.serverGroups.servers.unassign, {
				params: { groupId: server.groupId!, serverId: server.id },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['servers', server.id] });
			if (server.groupId) {
				queryClient.invalidateQueries({ queryKey: ['server-groups', server.groupId] });
			}
			queryClient.invalidateQueries({ queryKey: ['server-groups'] });
			toast.success(<Tran text="success" />);
		},
		onError: (error: Error) => {
			toast.error(<Tran text="error" />, { description: error.message });
		},
	});

	if (!server.groupId) {
		return (
			<div className="flex flex-col gap-2">
				<div className="text-sm text-muted-foreground flex items-center gap-2">
					<Tran text="server.no-group" />
				</div>
				<div className="flex items-center gap-2">
					<AssignGroupDialog groups={myGroups} onAssign={assignToGroup} disabled={isAssigning} />
					<Button asChild variant="secondary" size="sm" className="ml-auto">
						<LocalLink href={routes.serverGroups.value}>
							<Tran text="server.manage-groups" />
						</LocalLink>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex text-sm items-center gap-2">
				<Tran className="text-muted-foreground" text="server.assigned-group" />
				<LocalLink href={routes.serverGroups.id({ id: server.groupId }).value} className="underline">
					{group ? <ColorText text={group.name} /> : <LoadingSpinner />}
				</LocalLink>
			</div>
			<div className="flex items-center gap-2">
				<Button variant="destructive" size="sm" onClick={() => unassignFromGroup()} disabled={isUnassigning}>
					<Tran text="server.remove-from-group" />
				</Button>
				<Button asChild variant="secondary" size="sm" className="ml-auto">
					<LocalLink href={routes.serverGroups.value}>
						<Tran text="server.manage-groups" />
					</LocalLink>
				</Button>
			</div>
		</div>
	);
}

function AssignGroupDialog({
	groups,
	onAssign,
	disabled,
}: {
	groups: ServerGroupDto[];
	onAssign: (groupId: string) => void;
	disabled: boolean;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm">
					<Tran text="server.assign-group" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="server.assign-group" />
				</DialogTitle>
				<DialogDescription className="sr-only" />
				<div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
					{groups.length === 0 ? (
						<div className="text-center text-muted-foreground py-4">
							<Tran text="server.no-groups-available" />
						</div>
					) : (
						groups.map((g) => (
							<Button
								key={g.id}
								variant="outline"
								className="w-full justify-start"
								onClick={() => onAssign(g.id)}
								disabled={disabled}
							>
								<ColorText text={g.name} />
							</Button>
						))
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
