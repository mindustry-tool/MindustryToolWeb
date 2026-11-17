import type { AuthFilter } from '@mindustry-tool/api';

export type ServerRouteLink = {
	href: string;
	matchHref?: string;
	filter?: AuthFilter;
};

export function resolveServerRouteFilter(
	links: ServerRouteLink[],
	pathname: string,
	serverId: string,
): AuthFilter | undefined {
	const normalizedPath = pathname.replace(/\/$/, '');
	const isDashboard = normalizedPath.endsWith(`/servers/${serverId}`);
	const selected =
		links.findLast((link) => link.href !== '' && normalizedPath.endsWith(link.href)) ??
		links.find((link) => link.matchHref && normalizedPath.includes(link.matchHref)) ??
		(isDashboard ? links.find((link) => link.href === '') : undefined);

	return selected?.filter ?? (isDashboard ? undefined : true);
}
