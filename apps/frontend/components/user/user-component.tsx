'use client';

import type { Session } from '@mindustry-tool/api';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { LocalLink } from '@/components/common/locale-link';
import ErrorMessage from '@/components/error/error-message';
import { Skeleton } from '@/components/ui/skeleton';
import { Batcher } from '@/lib/batcher';
import { cn } from '@/lib/utils';
import { routes } from '../../config/routes';
import { useSession } from '@/hooks/use-session';

export type UserType = Pick<Session, 'id' | 'name' | 'roles'> & {
	imageUrl?: string | null;
	bannedUntil?: Date | null;
};

type UserContextType = {
	clickable?: boolean;
	user:
		| {
				state: 'loaded';
				data: UserType;
		  }
		| {
				state: 'loading';
		  }
		| {
				state: 'not-found';
		  };
};

const UserContext = React.createContext<UserContextType | null>(null);

UserContext.displayName = 'UserContext';

export const useUserContext = () => {
	const context = React.use(UserContext);

	if (!context) {
		throw new Error('useUserContext must be used within a UserProvider');
	}
	return context;
};

export function CurrentUserComponent({ children, clickable }: { children: ReactNode; clickable?: boolean }) {
	const { session, state } = useSession();

	const user = useMemo(
		() =>
			state === 'loading'
				? ({ state: 'loading' } as const)
				: state === 'authenticated'
					? ({ state: 'loaded', data: session } as const)
					: ({ state: 'not-found' } as const),
		[state, session],
	);

	return (
		<UserContext
			value={{
				clickable,
				user,
			}}
		>
			{children}
		</UserContext>
	);
}

export function UserWithIdComponent({
	userId,
	children,
	clickable,
}: {
	userId: string;
	children: ReactNode;
	clickable?: boolean;
}) {
	const { data, error, isLoading, isError } = useQuery({
		queryKey: ['users', userId],
		queryFn: () => Batcher.user.get(userId),
	});

	const user = useMemo(
		() =>
			isLoading
				? ({ state: 'loading' } as const)
				: data
					? ({ state: 'loaded', data } as const)
					: ({ state: 'not-found' } as const),
		[isLoading, data],
	);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<UserContext
			value={{
				clickable,
				user,
			}}
		>
			{children}
		</UserContext>
	);
}

export function UserWithAvatarAndName({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex gap-1 items-center', className)} {...props}>
			<UserAvatar />
			<UserName />
		</div>
	);
}

export function UserWithAvatarAndNameAndRole() {
	return (
		<div className="flex items-end gap-1">
			<UserAvatar />
			<div className="flex flex-col group-data-[collapsible=icon]:hidden">
				<UserName useColor={false} />
				<UserRole />
			</div>
		</div>
	);
}

type UserComponentType = {
	data: UserType;
	children: ReactNode;
	clickable?: boolean;
};

export function UserComponent({ children, data, clickable }: UserComponentType) {
	const user = useMemo(() => ({ state: 'loaded', data }) as const, [data]);

	return <UserContext value={{ user: user, clickable }}>{children}</UserContext>;
}

type UserAvatarProps = {
	className?: string;
	size?: number;
};

const colorArray = [
	'#FF6633',
	'#FFB399',
	'#FF33FF',
	'#FFFF99',
	'#00B3E6',
	'#E6B333',
	'#3366E6',
	'#999966',
	'#99FF99',
	'#B34D4D',
	'#80B300',
	'#809900',
	'#E6B3B3',
	'#6680B3',
	'#66991A',
	'#FF99E6',
	'#CCFF1A',
	'#FF1A66',
	'#E6331A',
	'#33FFCC',
	'#66994D',
	'#B366CC',
	'#4D8000',
	'#B33300',
	'#CC80CC',
	'#66664D',
	'#991AFF',
	'#E666FF',
	'#4DB3FF',
	'#1AB399',
	'#E666B3',
	'#33991A',
	'#CC9999',
	'#B3B31A',
	'#00E680',
	'#4D8066',
	'#809980',
	'#E6FF80',
	'#1AFF33',
	'#999933',
	'#FF3380',
	'#CCCC00',
	'#66E64D',
	'#4D80CC',
	'#9900B3',
	'#E64D66',
	'#4DB380',
	'#FF4D4D',
	'#99E6E6',
	'#6666FF',
];

export function UserAvatar({ className, size = 32 }: UserAvatarProps) {
	const [isError, setError] = useState(false);

	const { user, clickable } = useUserContext();

	if (user.state === 'loading') {
		return <Skeleton className="rounded-full" style={{ width: size, height: size, minWidth: size, minHeight: size }} />;
	}

	if (user.state === 'not-found') {
		return;
	}

	const { id, name, imageUrl } = user.data;

	if (!imageUrl || isError) {
		let total = 0;
		for (let i = 0; i < name.length; i++) {
			total += name.charCodeAt(i);
		}
		const color = colorArray[total % colorArray.length];

		return (
			<Clickable id={id} clickable={clickable}>
				<div
					className={cn(
						'flex overflow-hidden justify-center items-center text-white capitalize rounded-full border aspect-square border-border',
						className,
					)}
					style={{ backgroundColor: color, width: size, height: size, minWidth: size, minHeight: size }}
				>
					{typeof name === 'string' ? name.substring(0, 2) : ''}
				</div>
			</Clickable>
		);
	}

	return (
		<Clickable id={id} clickable={clickable}>
			<Image
				className={cn('object-cover overflow-hidden rounded-full border aspect-square border-border', className)}
				width={size}
				height={size}
				style={{ width: size, height: size, minWidth: size, minHeight: size }}
				src={`${imageUrl}?size=32`}
				alt={name}
				onError={() => setError(true)}
				loading="lazy"
			/>
		</Clickable>
	);
}

function Clickable({ id, clickable = true, children }: { children: ReactNode; id: string; clickable?: boolean }) {
	if (clickable) {
		return <LocalLink href={routes.users.id({ id })}>{children}</LocalLink>;
	}

	return children;
}

export function UserName({
	className,
	useColor = true,
	...props
}: Omit<React.ComponentProps<'span'>, 'children'> & { useColor?: boolean }) {
	const { user, clickable } = useUserContext();

	if (user.state === 'loading') {
		return <Skeleton className={cn('h-5 w-32', className)} />;
	}

	if (user.state === 'not-found') {
		return;
	}

	const { id, name, roles, bannedUntil } = user.data;

	const colors = [...roles]
		.sort((a, b) => b.level - a.level)
		.map((role) => role.color)
		.filter((color) => !!color)
		.map((color) => color!);

	const color = colors.length > 0 ? colors[0] : undefined;

	return (
		<Clickable id={id} clickable={clickable}>
			<span
				className={cn('font-semibold text-sm h-5', className)}
				style={{
					color: useColor ? color || undefined : undefined,
				}}
				{...props}
			>
				{
					// eslint-disable-next-line react-hooks/purity
					bannedUntil && new Date(bannedUntil).getTime() > Date.now() ? (
						<span className="text-red-500">[Banned] </span>
					) : (
						''
					)
				}
				{name}
			</span>
		</Clickable>
	);
}

export function UserRole({ className, ...props }: Omit<React.ComponentProps<'span'>, 'children'>) {
	const { user } = useUserContext();

	if (user.state === 'loading') {
		return <Skeleton className="h-8 w-24" />;
	}

	if (user.state === 'not-found') {
		return;
	}

	const { roles } = user.data;

	const role = [...roles].sort((a, b) => b.level - a.level)[0];

	if (!role) {
		return;
	}

	const { id, color } = role;

	if (id === 'user') {
		return;
	}

	return (
		<span
			className={cn('text-xs font-semibold uppercase', className)}
			style={{
				color: color ?? undefined,
			}}
			{...props}
		>
			{id}
		</span>
	);
}

export function UserCard({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('grid p-2 rounded-md bg-card', className)} {...props}>
			{children}
		</div>
	);
}
