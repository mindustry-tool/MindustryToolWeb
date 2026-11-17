'use client';

import { useI18n } from '@/i18n/i18n.client';
import React from 'react';
import { useMemo } from 'react';

// ONly lowercase
export type I18nKey = Lowercase<`${string}.${string}` | Lowercase<string>>;

type Props = {
	className?: string;
	text: I18nKey;
	style?: React.CSSProperties;
	args?: { [key: string]: string | number };
	asChild?: boolean;
};

// export default function Tran(props: Props): React.ReactNode {
// 	return (
// 		<Suspense fallback={<Skeleton className="h-5" style={{ width: props.defaultValue.length * 4 }} />}>
// 			<T {...props} />
// 		</Suspense>
// 	);
// }

// function TranKey({ text }: { text: string }) {

// 	return text;
// }

export const Tran = React.memo(({ text, args, asChild, ...rest }: Props): React.ReactNode => {
	const parts = text.split('.');

	let group: string, key: string;

	if (parts.length === 1) {
		group = 'common';
		key = parts[0] as string;
	} else {
		group = parts[0] as string;
		key = parts[1] as string;
	}

	const { t } = useI18n(group);

	const translated = useMemo(() => t(key, args ?? {}), [args, key, t]);

	if (asChild) {
		return translated;
	}

	return <span {...rest}>{translated}</span>;
});

Tran.displayName = 'Tran';
