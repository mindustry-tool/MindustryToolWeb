'use client';

import { api } from '@mindustry-tool/api';
import { useEffect } from 'react';
import { apiInstance } from '@/config/api';

export function PostViewTrigger({ postId }: { postId: string }) {
	useEffect(() => {
		apiInstance
			.request(api.v4.posts.view, {
				params: {
					id: postId,
				},
			})
			.catch(error => console.warn(error));
	}, [postId]);

	return undefined;
}
