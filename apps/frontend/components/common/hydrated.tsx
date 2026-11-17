'use client';

import type React from 'react';
import { useSyncExternalStore } from 'react';

type Props = {
	alt?: React.ReactNode;
	children: React.ReactNode;
};

const emptySubscribe = () => () => {};

export function useHydrated(): boolean {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
}

export function Hydrated({ alt, children }: Props) {
	const isHydrated = useHydrated();

	return isHydrated ? children : alt;
}
