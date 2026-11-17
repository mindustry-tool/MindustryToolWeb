'use client';

import { api } from '@mindustry-tool/api';

import { useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { usePathname } from 'next/navigation';
import { createContext, use, useMemo, type ReactNode } from 'react';
import type { NavGroup } from '@/app/[locale]/components/nav-groups';
import { appGroups } from '@/app/[locale]/components/nav-groups';
import { getServerNavGroups } from '@/app/[locale]/components/server-nav';
import { apiInstance } from '@/config/api';
import { SessionContext, SessionState, useSession } from '@/hooks/use-session';

export type NavContextValue =
	| {
			mode: 'app';
	  }
	| {
			mode: 'server';
			serverId: string;
			serverName?: string;
			serverAvatar?: string;
			serverIsOfficial?: boolean;
			ownerId?: string;
			showCreditPage: boolean;
			authorities: string[];
	  };

const NavContext = createContext<NavContextValue | null>(null);

NavContext.displayName = 'NavContext';

export function useNavContext(): NavContextValue {
	const context = use(NavContext);

	if (!context) {
		throw new Error('useNavContext must be used within a NavProvider');
	}

	return context;
}

export function getServerIdFromPathname(pathname: string): string | undefined {
	const match = pathname.match(/^\/[^/]+\/servers\/([^/]+)/);

	return match?.[1];
}

export function NavProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const serverId = getServerIdFromPathname(pathname);

	if (!serverId) {
		return <NavContext value={{ mode: 'app' }}>{children}</NavContext>;
	}

	return (
		<ServerNavProvider key={serverId} serverId={serverId}>
			{children}
		</ServerNavProvider>
	);
}

function ServerNavProvider({ serverId, children }: { serverId: string; children: ReactNode }) {
	const { data: server } = useQuery({
		queryKey: ['servers', serverId],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id: serverId,
				},
			}),
	});

	const { data: serverAuthorities } = useQuery({
		queryKey: ['servers', serverId, 'my-authorities'],
		queryFn: () =>
			apiInstance.request(api.v4.servers.getMyAuthorities, {
				params: {
					id: serverId,
				},
			}),
	});

	const value = useMemo<NavContextValue>(
		() => ({
			mode: 'server',
			serverId,
			serverName: server?.name,
			serverAvatar: server?.avatar ?? undefined,
			serverIsOfficial: server?.isOfficial,
			ownerId: server?.createdBy,
			showCreditPage: server ? !server.isOfficial : false,
			authorities: serverAuthorities ?? [],
		}),
		[server, serverId, serverAuthorities],
	);

	return <NavContext value={value}>{children}</NavContext>;
}

/**
 * Shadows SessionContext with user + server merged authorities.
 * Scope it around sidebar navigation only, so permission filters
 * can resolve server-level authorities.
 */
export function NavSessionScope({ children }: { children: ReactNode }) {
	const nav = useNavContext();
	const userSession = useSession();

	const sessionState: SessionState = useMemo(() => {
		if (nav.mode !== 'server') {
			return userSession;
		}

		if (userSession?.session) {
			return produce(userSession, (draft) => {
				const userAuth = draft.session?.authorities || [];
				const serverAuth = nav.authorities;

				draft.session.authorities = [...userAuth, ...serverAuth];
			});
		}

		return userSession;
	}, [nav, userSession]);

	return <SessionContext value={sessionState}>{children}</SessionContext>;
}

export function useNavGroups(): NavGroup[] {
	const nav = useNavContext();

	if (nav.mode === 'app') {
		return appGroups;
	}

	return getServerNavGroups(nav.serverId, nav.ownerId, nav.showCreditPage);
}
