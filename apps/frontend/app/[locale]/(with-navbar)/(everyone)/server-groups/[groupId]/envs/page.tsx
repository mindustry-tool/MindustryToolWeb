'use client';

import { use } from 'react';
import { ManageGroupEnvForm } from '../components/manage-group-env-form';

export default function GroupEnvsPage({ params }: PageProps<'/[locale]/server-groups/[groupId]/envs'>) {
	const { groupId } = use(params);
	return <ManageGroupEnvForm groupId={groupId} />;
}
