'use client';

import { Suspense, type ComponentProps, type ReactNode } from 'react';
import ProtectedElement from '@/components/layout/protected-element';
import { useSession } from '@/hooks/use-session';
import { useHydrated } from '@/components/common/hydrated';

type Props = Omit<ComponentProps<typeof ProtectedElement>, 'session'> & {
	loading?: ReactNode;
};

export default function ClientProtectedElement({ loading, alt, children, ...props }: Props) {
	const isHydrated = useHydrated();
	const { session, state } = useSession();

	if (!isHydrated) {
		return loading ?? alt ?? null;
	}

	if (state === 'loading') {
		return loading ?? alt ?? null;
	}

	return (
		<ProtectedElement session={session} alt={alt} {...props}>
			<Suspense>{children}</Suspense>
		</ProtectedElement>
	);
}
