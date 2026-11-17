import type { TagDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

type Props = {
	tag: TagDto;
};

export default function DeleteTagDialog({ tag }: Props) {
	const { id } = tag;

	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.tags.delete, {
				params: {
					id,
				},
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
			queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });
		},
	});

	return (
		<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
			<Tran text="delete" />
		</Button>
	);
}
