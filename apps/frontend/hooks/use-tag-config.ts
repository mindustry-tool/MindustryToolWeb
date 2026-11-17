import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { SHOW_TAG_NAME_PERSISTENT_KEY, SHOW_TAG_NUMBER_PERSISTENT_KEY } from '@/config/environment';

export function useTagConfig() {
	const [{ 'show-tag-name': showTagName, 'show-tag-number': showTagNumber }, setConfig] = useCookies([
		SHOW_TAG_NAME_PERSISTENT_KEY,
		SHOW_TAG_NUMBER_PERSISTENT_KEY,
	]);
	useEffect(() => {
		if (showTagName === undefined) {
			setConfig(SHOW_TAG_NAME_PERSISTENT_KEY, true, { path: '/' });
		}

		if (showTagNumber === undefined) {
			setConfig(SHOW_TAG_NUMBER_PERSISTENT_KEY, true, { path: '/' });
		}
	}, [setConfig, showTagName, showTagNumber]);

	return {
		showTagName,
		showTagNumber,
		setConfig,
	};
}
