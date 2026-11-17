'use client';

import { api } from '@mindustry-tool/api';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

type Props = {
	postId: string;
};

export default function DeletePostDialog({ postId }: Props) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.posts.delete, {
				params: {
					id: postId,
				},
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
			router.push(routes.posts.value);
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['posts'] });
		},
	});

	return (
		<>
			<AlertDialogTitle>
				<Tran text="delete" />
			</AlertDialogTitle>
			<VisuallyHidden>
				<AlertDialogDescription />
			</VisuallyHidden>
			<AlertDialogFooter>
				<AlertDialogCancel>
					<Tran text="cancel" />
				</AlertDialogCancel>
				<AlertDialogAction asChild>
					<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
						<Tran text="delete" />
					</Button>
				</AlertDialogAction>
			</AlertDialogFooter>
		</>
	);
}
