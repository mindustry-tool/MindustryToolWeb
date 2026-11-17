'use client';

import { use } from 'react';
import { ManageGroupWebhooks } from '../components/manage-group-webhooks';

export default function GroupWebhooksPage({ params }: PageProps<'/[locale]/server-groups/[groupId]/webhooks'>) {
	const { groupId } = use(params);
	return <ManageGroupWebhooks groupId={groupId} />;
}
