'use client';

import { REDIRECT_COOKIE_NAME } from '@mindustry-tool/api';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useCookies } from 'react-cookie';

export default function Redirect() {
	const pathname = usePathname();
	const query = useSearchParams();

	const redirect = useMemo(() => {
		const queryString = query.toString();
		return queryString ? `${pathname}?${queryString}` : pathname;
	}, [pathname, query]);

	const [, setCookie] = useCookies([REDIRECT_COOKIE_NAME]);

	useEffect(() => {
		if (pathname.includes('/redirect')) return;
		setCookie(REDIRECT_COOKIE_NAME, redirect, { path: '/' });
	}, [pathname, redirect, setCookie]);

	return undefined;
}
