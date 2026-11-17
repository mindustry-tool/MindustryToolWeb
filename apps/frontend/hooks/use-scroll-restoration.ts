'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const SCROLL_PERSIST_KEY = 'scroll-top';

/**
 * Retrieves the current browser URL or falls back to pathname on SSR.
 */
export function getCurrentUrl(fallbackPath = ''): string {
	if (typeof window === 'undefined') {
		return fallbackPath;
	}
	return window.location.href;
}

/**
 * Derives a storage key from the current URL and an optional container id.
 */
export function getScrollKey(url: string, id?: string): string {
	const suffix = id ? `-${id}` : '';
	return `${url}${suffix}`;
}

/**
 * Retrieves the stored scroll top for a given scroll key from sessionStorage.
 */
export function getStoredScrollTop(scrollKey: string): number {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return 0;
	}
	try {
		const scrollTops = JSON.parse(sessionStorage.getItem(SCROLL_PERSIST_KEY) || '{}') as Record<string, number>;
		return scrollTops[scrollKey] ?? scrollTops[`${scrollKey}-undefined`] ?? 0;
	} catch (error) {
		resetStoredScrollTop();
		console.error('Fail to get scroll top: ' + error);
		return 0;
	}
}

/**
 * Persists a scroll top offset for a given scroll key in sessionStorage.
 */
export function setStoredScrollTop(scrollKey: string, scrollTop: number): void {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return;
	}
	try {
		const scrollTops = JSON.parse(sessionStorage.getItem(SCROLL_PERSIST_KEY) || '{}') as Record<string, number>;
		scrollTops[scrollKey] = scrollTop;
		sessionStorage.setItem(SCROLL_PERSIST_KEY, JSON.stringify(scrollTops));
	} catch (error) {
		resetStoredScrollTop();
		console.error('Fail to set scroll top: ' + error);
	}
}

/**
 * Resets the scroll persistence sessionStorage.
 */
export function resetStoredScrollTop(): void {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return;
	}
	try {
		sessionStorage.setItem(SCROLL_PERSIST_KEY, JSON.stringify({}));
	} catch (error) {
		console.error('Fail to reset scroll top: ' + error);
	}
}

export type UseScrollRestorationOptions = {
	/**
	 * Unique identifier for the scroll container to differentiate multiple containers on the same page.
	 */
	id?: string;
	/**
	 * Whether scroll restoration and tracking are enabled. Defaults to true.
	 */
	enabled?: boolean;
	/**
	 * Whether the container's contents and layout are ready for scroll restoration. Defaults to true.
	 */
	ready?: boolean;
	/**
	 * Debounce duration in milliseconds for writing to sessionStorage. Defaults to 300ms.
	 */
	debounceMs?: number;
	/**
	 * Callback fired when a saved scroll position is successfully applied.
	 */
	onRestore?: (scrollTop: number) => void;
};

export function useScrollRestoration<T extends HTMLElement = HTMLElement>(
	ref: React.RefObject<T | null>,
	options: UseScrollRestorationOptions = {},
) {
	const { id, enabled = true, ready = true, debounceMs = 300, onRestore } = options;
	const pathname = usePathname();

	const [currentUrl, setCurrentUrl] = useState(() => getCurrentUrl(pathname));

	if (typeof window !== 'undefined' && window.location.href !== currentUrl) {
		setCurrentUrl(window.location.href);
	}

	useEffect(() => {
		const updateUrl = () => {
			if (typeof window !== 'undefined') {
				setCurrentUrl(window.location.href);
			}
		};

		window.addEventListener('popstate', updateUrl);
		window.addEventListener('hashchange', updateUrl);
		return () => {
			window.removeEventListener('popstate', updateUrl);
			window.removeEventListener('hashchange', updateUrl);
		};
	}, []);

	const scrollKey = useMemo(() => getScrollKey(currentUrl, id), [currentUrl, id]);

	const scrollTopRef = useRef(0);
	const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastRestoredKeyRef = useRef<string | null>(null);

	// Restore scroll position once container is ready
	useEffect(() => {
		if (!enabled || !ready || lastRestoredKeyRef.current === scrollKey) {
			return;
		}

		const el = ref.current;
		if (!el) {
			return;
		}

		lastRestoredKeyRef.current = scrollKey;

		let timer: ReturnType<typeof setTimeout> | undefined;
		const savedTop = getStoredScrollTop(scrollKey);
		if (savedTop > 0) {
			el.scrollTo({ top: savedTop });
			onRestore?.(savedTop);

			timer = setTimeout(() => {
				if (ref.current) {
					ref.current.scrollTo({ top: savedTop });
				}
			}, 0);
		} else {
			el.scrollTo({ top: 0 });
			onRestore?.(0);
		}

		return () => {
			if (timer) {
				clearTimeout(timer);
			}
		};
	}, [enabled, ready, scrollKey, ref, onRestore]);

	// Listen to scroll events and persist debounced
	useEffect(() => {
		if (!enabled) {
			return;
		}

		const el = ref.current;
		if (!el) {
			return;
		}

		const handleScroll = () => {
			scrollTopRef.current = el.scrollTop;

			if (!persistTimerRef.current) {
				persistTimerRef.current = setTimeout(() => {
					persistTimerRef.current = null;
					setStoredScrollTop(scrollKey, scrollTopRef.current);
				}, debounceMs);
			}
		};

		el.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			el.removeEventListener('scroll', handleScroll);
			if (persistTimerRef.current) {
				clearTimeout(persistTimerRef.current);
				persistTimerRef.current = null;
				setStoredScrollTop(scrollKey, scrollTopRef.current);
			}
		};
	}, [enabled, scrollKey, debounceMs, ref]);

	const persist = useCallback(
		(top?: number) => {
			const targetTop = top ?? ref.current?.scrollTop ?? scrollTopRef.current;
			setStoredScrollTop(scrollKey, targetTop);
		},
		[scrollKey, ref],
	);

	return {
		scrollKey,
		getSavedScrollTop: useCallback(() => getStoredScrollTop(scrollKey), [scrollKey]),
		persist,
	};
}
