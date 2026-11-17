'use client';

import { api } from '@mindustry-tool/api';

import { useQuery } from '@tanstack/react-query';

import { usePathname } from 'next/navigation';
import { produce } from 'immer';
import { Suspense, use, useMemo } from 'react';
import { CatchError } from '@/components/error/catch-error';
import NotFoundCard from '@/components/common/not-found-card';
import ProtectedRoute from '@/components/layout/protected-route';
import { getServerLinks } from '@/app/[locale]/components/server-nav';
import { resolveServerRouteFilter } from './route-filter';
import { apiInstance } from '@/config/api';
import { SessionContext, SessionState, useSession } from '@/hooks/use-session';

export default function Layout({ params, children }: LayoutProps<'/[locale]/servers/[id]'>) {
	const { id } = use(params);
	const pathname = usePathname();

	const { data, isError } = useQuery({
		queryKey: ['servers', id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id,
				},
			}),
	});

	const ownerId = data?.createdBy;
	const showCreditPage = data ? !data.isOfficial : false;

	const links = useMemo(() => getServerLinks(ownerId, showCreditPage), [ownerId, showCreditPage]);

	const userSession = useSession();

	const { data: serverAuthorities } = useQuery({
		queryKey: ['servers', id, 'my-authorities'],
		queryFn: () =>
			apiInstance.request(api.v4.servers.getMyAuthorities, {
				params: {
					id,
				},
			}),
		enabled: Boolean(userSession?.session),
	});

	const sessionState: SessionState = useMemo(() => {
		if (userSession?.session) {
			return produce(userSession, (draft) => {
				const userAuth = draft.session?.authorities || [];
				const serverAuth = serverAuthorities || [];

				draft.session.authorities = [...userAuth, ...serverAuth];
			});
		}

		return userSession;
	}, [userSession, serverAuthorities]);

	if (isError) {
		return (
			<div className="relative flex h-full w-full flex-col overflow-hidden">
				<NotFoundCard />
			</div>
		);
	}

	const filter = resolveServerRouteFilter(links, pathname, id);

	return (
		<SessionContext value={sessionState}>
			<div className="relative flex h-full w-full flex-col overflow-hidden" key="child">
				<Suspense>
					<CatchError>
						{filter !== undefined ? <ProtectedRoute filter={filter}>{children}</ProtectedRoute> : children}
					</CatchError>
				</Suspense>
			</div>
		</SessionContext>
	);
}
