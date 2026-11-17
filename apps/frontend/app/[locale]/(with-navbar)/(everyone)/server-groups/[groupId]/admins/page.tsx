'use client';

import { use } from 'react';
import { ManageGroupAdminForm } from '../components/manage-group-admin-form';

export default function GroupAdminsPage({ params }: PageProps<'/[locale]/server-groups/[groupId]/admins'>) {
	const { groupId } = use(params);
	return <ManageGroupAdminForm groupId={groupId} />;
}
