'use client';

import { use } from 'react';
import { ManageGroupServers } from '../components/manage-group-servers';

export default function GroupServersPage({ params }: PageProps<'/[locale]/server-groups/[groupId]/servers'>) {
	const { groupId } = use(params);
	return <ManageGroupServers groupId={groupId} />;
}
