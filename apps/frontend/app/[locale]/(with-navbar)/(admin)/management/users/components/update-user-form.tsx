import type { UpdateUserSchema, UserDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { ADMIN_AUTHORITIES } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { ApiItem } from '@/components/query/api-item';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { UserComponent, UserWithAvatarAndName } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { cn, getColor, TEXT_COLORS } from '@/lib/utils';

export default function UpdateUserForm({ user }: { user: UserDto }) {
	const [authorities, setAuthorities] = useState<string[]>(user.authorities || []);

	useEffect(() => {
		setTimeout(() => setAuthorities(user.authorities || []), 0);
	}, [user.authorities]);

	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationKey: ['update-user'],
		mutationFn: (data: UpdateUserSchema) =>
			apiInstance.request(api.v4.users.update, {
				body: data,
				params: {
					id: user.id,
				},
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
			toast.success(<Tran text="success" />, {
				description: <Tran text="user.updated" />,
			});
		},
	});

	const debouncedMutate = useDebounceCallback((newAuthorities: string[]) => {
		mutate({ authorities: newAuthorities as UpdateUserSchema['authorities'] });
	}, 500);

	const handleAuthoritiesChange = (values: string[]) => {
		const filtered = values.filter((a) => ADMIN_AUTHORITIES.includes(a as (typeof ADMIN_AUTHORITIES)[number]));
		setAuthorities(filtered);
		debouncedMutate(filtered);
	};

	return (
		<div className="flex flex-col gap-4">
			<UserComponent data={user}>
				<UserWithAvatarAndName />
			</UserComponent>
			<div className="flex flex-col gap-2">
				<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					<Tran text="roles" />
				</span>
				<UpdateRoleForm user={user} />
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					<Tran text="authorities" />
				</span>
				<ToggleGroup type="multiple" value={authorities} onValueChange={handleAuthoritiesChange} asChild>
					<div className="space-y-1 space-x-1">
						{ADMIN_AUTHORITIES.map((authority) => (
							<ToggleGroupItem
								className={cn('rounded-md border', getColor(authority.split(':')[0], TEXT_COLORS), {
									'text-destructive data-[state=on]:text-destructive hover:text-destructive': authority === 'god',
								})}
								key={authority}
								value={authority}
							>
								{authority}
							</ToggleGroupItem>
						))}
					</div>
				</ToggleGroup>
			</div>
		</div>
	);
}

function UpdateRoleForm({ user }: { user: UserDto }) {
	const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles.map((role) => role.id));

	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationKey: ['update-user-roles'],
		mutationFn: (data: string[]) =>
			apiInstance.request(api.v4.users.updateUserRoles, {
				body: data,
				params: {
					id: user.id,
				},
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'], exact: false });
			toast.success(<Tran text="success" />, {
				description: <Tran text="user.updated" />,
			});
		},
	});

	const debounceMutate = useDebounceCallback(mutate, 1000);

	return (
		<ToggleGroup
			type="multiple"
			value={selectedRoles}
			onValueChange={(value) => {
				setSelectedRoles(value);
				debounceMutate(value);
			}}
			asChild
		>
			<div className="space-y-1 space-x-1">
				<ApiItem queryKey={['roles']} route={api.v4.roles.findAll}>
					{(items) =>
						items
							.sort((a, b) => b.level - a.level)
							.map((item) => (
								<ToggleGroupItem className="rounded-md border" key={item.id} value={item.id}>
									<span
										className="font-semibold"
										style={{
											color: item.color || undefined,
										}}
									>
										{item.id}
									</span>
								</ToggleGroupItem>
							))
					}
				</ApiItem>
			</div>
		</ToggleGroup>
	);
}
