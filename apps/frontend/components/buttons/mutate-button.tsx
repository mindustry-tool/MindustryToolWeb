import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import { useEffect } from 'react';

export function MutateButton({
	queryKey,
	children,
	mutationFn,
	mutationKey,
	shortcut,
	disabled,
	...props
}: React.ComponentProps<typeof Button> & {
	mutationKey: string[];
	queryKey: string[];
	shortcut?: 'enter' | 'esc';
	mutationFn: () => Promise<unknown>;
} & { on?: Pick<Parameters<typeof useMutation>[0], 'onError' | 'onSuccess' | 'onMutate' | 'onSettled'> }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation<unknown>({
		...props,
		mutationFn,
		onError: (error, variable, r, context) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
			props?.on?.onError?.(error, variable, r, context);
		},
		onSuccess: (data, variable, r, context) => {
			props?.on?.onSuccess?.(data, variable, r, context);
			queryClient.invalidateQueries({ queryKey, exact: false });
		},
		onSettled: (data, error, variable, r, context) => {
			props?.on?.onSettled?.(data, error, variable, r, context);
		},
	});

	useEffect(() => {
		if (shortcut) {
			if (isPending || disabled) {
				return;
			}

			function handle(event: KeyboardEvent) {
				if (shortcut === 'enter' && event.key === 'Enter') {
					mutate();
				} else if (shortcut === 'esc' && event.key === 'Escape') {
					mutate();
				}
			}

			document.addEventListener('keydown', handle);

			return () => document.removeEventListener('keydown', handle);
		}
		return undefined;
	}, [isPending, disabled, shortcut, mutate]);

	return (
		<Button {...props} disabled={isPending || disabled} onClick={() => mutate()}>
			{children}
		</Button>
	);
}
