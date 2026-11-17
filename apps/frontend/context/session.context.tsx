'use client';

import React, { useMemo, type ReactNode } from 'react';

import dynamic from 'next/dynamic';
import { defaultContextValue, SessionContext, SessionState } from '@/hooks/use-session';
import { apiInstance } from '@/config/api';
import { api, type Session } from '@mindustry-tool/api';
import { ApiError } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';

const SessionErrorScreen = dynamic(() => import('@/components/common/session-error-screen'), { ssr: false });

const SessionProvider = React.memo(({ children }: { children: ReactNode }) => {
	const { data, error, isFetching } = useQuery({
		queryKey: ['session'],
		queryFn: async () => {
			try {
				const data = await apiInstance.request(api.v4.auth.session, {});
				return data;
			} catch (e) {
				if (e instanceof ApiError && e.response.status === 401) {
					return null;
				}
				throw e;
			}
		},
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchInterval: 1000 * 60 * 10,
	});

	const session: SessionState = useMemo(() => {
		if (data && typeof data === 'object' && 'id' in data && Array.isArray((data as Session).authorities)) {
			return { session: data as Session, state: 'authenticated' };
		}

		if (data === null || (data as unknown) === '' || (data && typeof data === 'object' && Object.keys(data).length === 0) || error) {
			return { session: null, state: 'unauthenticated' };
		}

		return defaultContextValue;
	}, [error, data]);

	return (
		<SessionContext value={session}>
			{!!error && !(error instanceof ApiError && error.response.status === 401) && (
				<SessionErrorScreen error={error} isFetching={isFetching} />
			)}
			{children}
		</SessionContext>
	);
});

SessionProvider.displayName = 'SessionProvider';

export { SessionProvider };
