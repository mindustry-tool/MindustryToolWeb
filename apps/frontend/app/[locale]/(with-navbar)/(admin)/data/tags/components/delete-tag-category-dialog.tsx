import type { TagCategoryDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

type Props = {
	category: TagCategoryDto;
};

export default function DeleteTagCategoryDialog({ category }: Props) {
	const { id } = category;

	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.tags.categories.delete, {
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
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });
			queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
			queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
		},
	});

	return (
		<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
			<Tran text="delete" />
		</Button>
	);
}
