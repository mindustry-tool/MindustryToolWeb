'use client';

import { api } from '@mindustry-tool/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ErrorMessage from '@/components/error/error-message';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/config/api';
import { useSession } from '@/hooks/use-session';
import { Batcher } from '@/lib/batcher';
import { Tran } from '@/i18n/tran';
import LoginButton from '@/components/buttons/login-button';

const itemTypes = {
	posts: Batcher.postLikes,
	schematics: Batcher.schematicLikes,
	maps: Batcher.mapLikes,
	'content-patches': Batcher.contentPatchLikes,
} as const;

export function LikeButton(
	props: React.ComponentProps<typeof Button> & {
		data: {
			likes: number;
			itemId: string;
		};
		itemType: keyof typeof itemTypes;
	},
) {
	const { state: authState } = useSession();

	if (authState === 'authenticated') {
		return <AuthLikeButton {...props} />;
	}

	return <UnauthLikeButton {...props} />;
}

const toastUnauthMessage = () => {
	toast.info(<Tran text="like.login-to-like" />, {
		description: <LoginButton />,
	});
};

function UnauthLikeButton({ data: { likes }, itemType, ...props }: React.ComponentProps<typeof LikeButton>) {
	return (
		<Button variant="ghost" {...props} onClick={toastUnauthMessage}>
			<Heart className="size-4" size={20} />
			{likes}
		</Button>
	);
}

function AuthLikeButton({
	data: { likes: initialLikes, itemId },
	itemType,
	...props
}: React.ComponentProps<typeof LikeButton>) {
	const queryClient = useQueryClient();

	const { data, isError, error } = useQuery({
		queryKey: [itemId, itemType, 'like'],
		queryFn: () => itemTypes[itemType].get(itemId),
	});

	const [state, setState] = useState(
		data
			? {
					isLiked: true,
					likes: initialLikes,
				}
			: {
					isLiked: false,
					likes: initialLikes,
				},
	);

	const isLiked = data ? true : state.isLiked;
	const likes = state.likes;

	const { mutate } = useMutation({
		mutationKey: [itemType, itemId, 'like'],
		mutationFn: () =>
			apiInstance.request(api.v4.likes.create, {
				params: {
					itemType,
					itemId,
				},
			}),
		onMutate: () => {
			setState((prev) => ({
				isLiked: !prev.isLiked,
				likes: prev.likes + (prev.isLiked ? -1 : 1),
			}));
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (data) => {
			setState({
				isLiked: data.state === 1,
				likes: data.likeCount,
			});
			queryClient.invalidateQueries({ queryKey: [itemId, itemType, 'like'] });
		},
	});

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return (
		<Button variant="ghost" {...props} onClick={() => mutate()}>
			{isLiked ? (
				<Heart stroke="var(--color-red-300)" fill="var(--color-red-400)" className="size-4" size={20} />
			) : (
				<Heart className="size-4" size={20} />
			)}
			{likes}
		</Button>
	);
}
