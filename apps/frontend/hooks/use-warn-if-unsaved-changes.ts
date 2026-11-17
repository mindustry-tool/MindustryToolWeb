import { useCallback, useEffect } from 'react';

export const useWarnIfUnsavedChanges = (unsaved: boolean) => {
	const handleAnchorClick = useCallback((e: MouseEvent) => {
		if (e.button !== 0) {
			return;
		} // only handle left-clicks
		const targetUrl = (e.currentTarget as HTMLAnchorElement).href;
		const currentUrl = window.location.href;

		if (targetUrl !== currentUrl && window.onbeforeunload) {
			const res = window.onbeforeunload;
			if (!res) {
				e.preventDefault();
			}
		}
	}, []);

	const addAnchorListeners = useCallback(() => {
		const anchorElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[href]');
		anchorElements.forEach((anchor) => anchor.addEventListener('click', handleAnchorClick));
	}, [handleAnchorClick]);

	useEffect(() => {
		const mutationObserver = new MutationObserver(addAnchorListeners);
		mutationObserver.observe(document.body, { childList: true, subtree: true });

		addAnchorListeners();

		return () => {
			mutationObserver.disconnect();
			const anchorElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[href]');
			anchorElements.forEach((anchor) => anchor.removeEventListener('click', handleAnchorClick));
		};
	}, [addAnchorListeners, handleAnchorClick]);

	useEffect(() => {
		const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};

		const handlePopState = (e: PopStateEvent) => {
			if (unsaved) {
				const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
				if (!confirmLeave) {
					e.preventDefault();
					window.history.pushState(null, '', window.location.href);
				}
			}
		};

		if (unsaved) {
			window.addEventListener('beforeunload', beforeUnloadHandler);
			window.addEventListener('popstate', handlePopState);
		} else {
			window.removeEventListener('beforeunload', beforeUnloadHandler);
			window.removeEventListener('popstate', handlePopState);
		}

		return () => {
			window.removeEventListener('beforeunload', beforeUnloadHandler);
			window.removeEventListener('popstate', handlePopState);
		};
	}, [unsaved]);
};
