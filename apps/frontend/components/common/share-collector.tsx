'use client';

import { apiInstance } from '@/config/api';
import { api } from '@mindustry-tool/api';
import { SHARE_QUERY_NAME } from '@mindustry-tool/api';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

export function ShareCollector() {
	const [shareId] = useQueryState(SHARE_QUERY_NAME);

	useEffect(() => {
		if (shareId) {
			apiInstance.tryRequest(api.v4.share.visit, {
				params: {
					id: shareId,
				},
			});
		}
	}, [shareId]);

	return undefined;
}
