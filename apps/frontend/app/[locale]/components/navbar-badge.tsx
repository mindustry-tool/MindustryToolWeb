'use client';

import { api } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { SidebarMenuBadge } from '@/components/ui/sidebar';
import { apiInstance } from '@/config/api';
import { useSession } from '@/hooks/use-session';
import { useCounter } from '@/hooks/use-counter';

const useVerifySchematicCount = () => {
	const { data } = useQuery({
		queryKey: ['schematics', 'count', 'verify'],
		queryFn: () =>
			apiInstance.request(api.v4.schematics.count, {
				query: {
					verification: 'PENDING',
				},
			}),
	});

	return data || 0;
};

const useVerifyMapCount = () => {
	const { data } = useQuery({
		queryKey: ['maps', 'count', 'verify'],
		queryFn: () =>
			apiInstance.request(api.v4.maps.count, {
				query: {
					verification: 'PENDING',
				},
			}),
	});

	return data || 0;
};

const useVerifyContentPatchCount = () => {
	const { data } = useQuery({
		queryKey: ['content-patches', 'count', 'verify'],
		queryFn: () =>
			apiInstance.request(api.v4.contentPatches.count, {
				query: {
					verification: 'PENDING',
				},
			}),
	});

	return data || 0;
};

export function VerifySchematicBadge() {
	const count = useVerifySchematicCount();
	const rounded = useCounter(0, count, 0.25);

	if (count === 0) {
		return undefined;
	}

	return (
		<SidebarMenuBadge>
			<p>{rounded}</p>
		</SidebarMenuBadge>
	);
}

export function VerifyMapBadge() {
	const data = useVerifyMapCount();
	const rounded = useCounter(0, data, 0.25);

	if (data === 0) {
		return undefined;
	}

	return (
		<SidebarMenuBadge>
			<p>{rounded}</p>
		</SidebarMenuBadge>
	);
}

export function VerifyContentPatchBadge() {
	const data = useVerifyContentPatchCount();
	const rounded = useCounter(0, data, 0.25);

	if (data === 0) {
		return undefined;
	}

	return (
		<SidebarMenuBadge>
			<p>{rounded}</p>
		</SidebarMenuBadge>
	);
}

export function VerifyBadge() {
	const { session } = useSession();

	const schematics = useVerifySchematicCount();
	const maps = useVerifyMapCount();
	const contentPatches = useVerifyContentPatchCount();

	let total = 0;
	if (hasAccess(session, 'schematic:manage')) {
		total += schematics;
	}

	if (hasAccess(session, 'map:manage')) {
		total += maps;
	}

	if (hasAccess(session, 'content-patch:manage')) {
		total += contentPatches;
	}

	const rounded = useCounter(0, total, 0.25);

	if (total === 0) {
		return undefined;
	}

	return <p>{rounded}</p>;
}

export function UserBadge() {
	const { data } = useQuery({
		queryKey: ['users', 'count'],
		queryFn: () =>
			apiInstance.request(api.v4.users.count, {
				query: {
					role: undefined,
				},
			}),
	});

	const rounded = useCounter(0, data || 0, 0.25);

	return (
		<SidebarMenuBadge>
			<p>{rounded}</p>
		</SidebarMenuBadge>
	);
}
