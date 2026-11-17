'use client';

import { useEffect, useState, type ReactNode } from 'react';
import ReactDOM from 'react-dom';

type ParentId = 'nav-header';

export default function Portal({ parentId, children }: { parentId: ParentId; children: ReactNode }) {
	const [isHydrated, setHydrated] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHydrated(true);
	}, []);

	if (!isHydrated) {
		return null;
	}

	if (typeof window === 'undefined') {
		return null;
	}

	const container = document.getElementById(parentId);

	if (!container) {
		throw new Error(`Container with id: ${parentId} not found`);
	}

	return ReactDOM.createPortal(children, container);
}
