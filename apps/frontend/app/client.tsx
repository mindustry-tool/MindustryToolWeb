'use client';

import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useQuery } from '@tanstack/react-query';
import { Tran } from '@/i18n/tran';
import { Button } from '@/components/ui/button';
import { ensureMidCookie, MID_COOKIE_NAME } from '@/lib/cookie.utils';

export default function ClientInit() {
	useInitMidCookie();

	return <VersionQuery />;
}

function useInitMidCookie() {
	const [cookies, setCookie] = useCookies([MID_COOKIE_NAME]);
	const rawMid: unknown = cookies[MID_COOKIE_NAME];
	const mid = typeof rawMid === 'string' ? rawMid : undefined;

	useEffect(() => {
		let cancelled = false;

		void ensureMidCookie({
			existingMid: mid,
			documentCookie: typeof document !== 'undefined' ? document.cookie : undefined,
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
			setCookie,
			hasMidCookie: () => typeof document !== 'undefined' && document.cookie.includes(`${MID_COOKIE_NAME}=`),
			isCancelled: () => cancelled,
		});

		return () => {
			cancelled = true;
		};
	}, [mid, setCookie]);
}

function VersionQuery() {
	const { data: version } = useQuery({
		queryKey: ['version'],
		queryFn: async () => {
			const response = await fetch(`/api/v1/version`, { signal: AbortSignal.timeout(5000) });
			const json = (await response.json()) as { version: string };

			return json.version;
		},
		refetchOnWindowFocus: 'always',
	});

	if (version && version !== process.env.NEXT_PUBLIC_BUILD_VERSION) {
		return (
			<div
				className="fixed inset-0 flex justify-center items-center z-50 
                bg-black/30 backdrop-blur-sm backdrop-brightness-75"
			>
				<div className="flex flex-col gap-2 p-6 rounded-md bg-card z-50">
					<Tran text="new-version-detected" />
					<Button onClick={() => window.location.reload()}>
						<Tran text="reload" />
					</Button>
				</div>
			</div>
		);
	}

	return undefined;
}
