import { useEffect } from 'react';

export default function usePersistForm(value: unknown, localStorageKey: string) {
	useEffect(() => {
		localStorage.setItem(localStorageKey, JSON.stringify(value));
	}, [value, localStorageKey]);
}
