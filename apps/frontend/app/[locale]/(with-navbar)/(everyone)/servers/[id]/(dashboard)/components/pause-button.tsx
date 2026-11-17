'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/config/api';

export function PauseButton({ serverId, statusText }: { serverId: string; statusText?: string }) {
	const queryClient = useQueryClient();
	const [isPaused, setIsPaused] = useState(() => statusText === 'PAUSED');

	useEffect(() => {
		setTimeout(() => {
			setIsPaused(statusText === 'PAUSED');
		}, 0);
	}, [statusText]);

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.servers.pause, {
				params: { id: serverId },
			}),
		onSuccess: (newPausedState) => {
			if (typeof newPausedState === 'boolean') {
				setIsPaused(newPausedState);
			}
		},
		onError: (error) => {
			toast.error(String(error));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['servers'] });
		},
	});

	if (statusText !== 'ONLINE' && statusText !== 'PAUSED') {
		return null;
	}

	return (
		<Button variant="secondary" disabled={isPending} onClick={() => mutate()}>
			{isPaused ? 'Unpause' : 'Pause'}
		</Button>
	);
}
