import { api } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';

export async function getUser(id: string) {
	return apiInstance.tryRequest(api.v4.users.getById, {
		params: {
			id,
		},
	});
}
