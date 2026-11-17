'use client';

import type { AuthFilter } from '@mindustry-tool/api';
import type { ReactNode } from 'react';

import { hasAccess } from '@mindustry-tool/api';
import LoginButton from '@/components/buttons/login-button';
import { useSession } from '@/hooks/use-session';
import NotFoundCard from '@/components/common/not-found-card';
import { useHydrated } from '@/components/common/hydrated';

type Props = {
	filter: AuthFilter;
	children: ReactNode;
};

export default function ProtectedRoute({ filter, children }: Props) {
	const isHydrated = useHydrated();
	const { session, state } = useSession();

	if (!isHydrated || state === 'loading') {
		return undefined;
	}

	if (!session) {
		return (
			<div className="m-auto flex h-full w-fit items-center justify-center">
				<LoginButton />
			</div>
		);
	}

	const canAccess = hasAccess(session, filter);

	if (!canAccess) {
		return <NotFoundCard />;
	}

	return children;
}
