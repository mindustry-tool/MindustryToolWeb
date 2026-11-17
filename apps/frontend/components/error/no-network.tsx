'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { Tran } from '@/i18n/tran';

export function NoNetwork() {
	const queryClient = useQueryClient();

	const clearCache = useEffectEvent(() => {
		queryClient.invalidateQueries({ exact: false });
	});

	useEffect(() => {
		clearCache();
	}, []);

	return <span><Tran text="no-network" /></span>;
}
