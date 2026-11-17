'use client';

import { LOCALES } from '@mindustry-tool/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function LocalLink({
	className,
	href,
	children,
	prefetch = false,
	...props
}: React.ComponentProps<typeof Link>) {
	const { locale } = useParams();

	const hrefWithLocale = useMemo(() => {
		let stringHref = href.toString();

		if (stringHref.startsWith('http')) {
			return stringHref;
		}

		stringHref = stringHref.startsWith('/') ? stringHref : `/${stringHref}`;
		const hasLocale = LOCALES.some((locale) => stringHref.startsWith(`/${locale}`));

		if (!hasLocale) {
			return `/${locale}${stringHref}`;
		}

		const currentLocale = stringHref.substring(1, 3);

		if (currentLocale === locale) {
			return stringHref;
		} else {
			return `/${locale}${stringHref.toString().substring(3)}`;
		}
	}, [href, locale]);

	return (
		<Link className={'cursor-pointer ' + className} href={hrefWithLocale} prefetch={prefetch} {...props}>
			{children}
		</Link>
	);
}
