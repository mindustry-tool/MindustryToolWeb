'use client';

import FallbackImage from '@/components/common/fallback-image';
import { LocalLink } from '@/components/common/locale-link';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { Skeleton } from '@/components/ui/skeleton';
import environment from '@/config/environment';
import { routes } from '@/config/routes';
import { api } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';
import Image from 'next/image';
import { useMemo } from 'react';

const DISPLAY_COUNT = 10;

export default function DashboardMapList({ server }: { server: ServerDto }) {
	const { id } = server;
	const mapsQueryKey = useMemo(() => ['servers', id, 'maps'], [id]);

	return (
		<ApiItem
			route={api.v4.servers.maps.getAll}
			queryKey={mapsQueryKey}
			params={{ id }}
			loading={() => (
				<div className="grid h-fit w-full grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
					<Skeletons number={DISPLAY_COUNT}>
						<Skeleton className="w-full h-32" />
					</Skeletons>
				</div>
			)}
			empty={() => (
				<div className="grid h-fit w-full grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
					<LocalLink
						className="flex relative aspect-square h-auto w-full items-center justify-center rounded-sm bg-card"
						href={routes.servers.id({ id }).maps}
					>
						<Image
							className="h-auto w-full aspect-square max-w-md rounded-sm object-cover"
							src={`https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png`}
							alt="nomap"
							width={256}
							height={256}
						/>
						<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-semibold text-lg text-nowrap">
							Add map
						</span>
					</LocalLink>
				</div>
			)}
		>
			{(items) => (
				<div className="grid h-fit w-full grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
					{items.slice(0, DISPLAY_COUNT).map((item) => (
						<FallbackImage
							key={item.filename}
							className="h-auto w-full aspect-square max-w-md rounded-sm object-cover"
							src={`${environment.url.apiV4}/servers/${id}/files?path=${encodeURIComponent(item.filename)}.png`}
							errorSrc="https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png"
							alt=''
							width={256}
							height={256}
						/>
					))}
					{items.length > DISPLAY_COUNT && (
						<LocalLink
							className="flex relative aspect-square h-auto w-full items-center justify-center rounded-sm bg-card"
							href={routes.servers.id({ id }).maps}
						>
							<Image
								className="h-auto w-full aspect-square max-w-md rounded-sm object-cover"
								src={`https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png`}
								alt="nomap"
								width={256}
								height={256}
							/>
							<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-semibold text-lg">
								{items.length - DISPLAY_COUNT}+
							</span>
						</LocalLink>
					)}
				</div>
			)}
		</ApiItem>
	);
}
