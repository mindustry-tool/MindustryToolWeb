import { apiInstance } from '@/config/api';
import { api } from '@mindustry-tool/api';
import StatsClient from './stats-client';

export default async function StatsSection() {
	let schematicsCount = 0;
	let mapsCount = 0;
	let serversCount = 0;

	try {
		[schematicsCount, mapsCount, serversCount] = await Promise.all([
			apiInstance.request(api.v4.schematics.count, {
				query: { verification: 'VERIFIED' },
				next: { revalidate: 60 * 60 * 24 },
			}),
			apiInstance.request(api.v4.maps.count, {
				query: { verification: 'VERIFIED' },
				next: { revalidate: 60 * 60 * 24 },
			}),
			apiInstance.request(api.v4.servers.count, {
				next: { revalidate: 60 * 60 * 24 },
			}),
		]);
	} catch (error) {
		console.error('Failed to fetch stats:', error);
	}

	return <StatsClient schematicsCount={schematicsCount} mapsCount={mapsCount} serversCount={serversCount} />;
}
