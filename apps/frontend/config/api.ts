import { ApiInstance } from '@mindustry-tool/api';
import environment from '@/config/environment';
import { getQueryClient } from '@/react-query/query.provider';

export const apiInstance = new ApiInstance({
	baseUrl: environment.url.apiV4,
	skipResponseValidation: true,
	onUnauthorized: () => {
		if (typeof window !== 'undefined') {
			getQueryClient().setQueryData(['session'], null);
		}
	},
});
