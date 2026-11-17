import type { PlanetDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

type Props = {
	planet: PlanetDto;
};

export default function DeletePlanetDialog({ planet }: Props) {
	const { id } = planet;

	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.planets.delete, {
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
			queryClient.invalidateQueries({ queryKey: ['planets'] });
		},
	});

	return (
		<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
			<Tran text="delete" />
		</Button>
	);
}
