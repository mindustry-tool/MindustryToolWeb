'use client';

import type { PlayerConnectProvider, PlayerConnectRoomWithLink } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { getPlayerConnectRoomQuerySchema } from '@mindustry-tool/api';

import { useQuery } from '@tanstack/react-query';
import { Lock, Signal } from 'lucide-react';
import { Suspense, useCallback } from 'react';
import ColorText from '@/components/common/color-text';
import { RelativeTime } from '@/components/common/relative-time';
import { ApiItem } from '@/components/query/api-item';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Tran } from '@/i18n/tran';
import { cn, ping } from '@/lib/utils';
import ScrollContainer from '@/components/common/scroll-container';
import { PageContent, PageWrapper } from '@/components/common/page-wrapper';

const PLAYER_CONNECTS_PROVIDERS_QUERY_KEY = ['player-connects', 'providers'];
const PLAYER_CONNECTS_ROOMS_QUERY_KEY = ['player-connects', 'rooms'];

export default function Page() {
	return (
		<PageWrapper>
			<ScrollContainer>
				<PageContent>
					<Tran
						className="text-xl font-semibold"
						text="player-connect.provider"
					/>
					<Separator />
					<div className="grid grid-cols-[repeat(auto-fill,minmax(min(500px,90vw),1fr))] gap-2">
						<ApiItem
							route={api.v4.playerConnects.getProviders}
							queryKey={PLAYER_CONNECTS_PROVIDERS_QUERY_KEY}
							loading={() => (
								<>
									<Skeleton className="h-20 border" />
									<Skeleton className="h-20 border" />
									<Skeleton className="h-20 border" />
									<Skeleton className="h-20 border" />
									<Skeleton className="h-20 border" />
								</>
							)}
						>
							{(items) => items.map((item) => <ProviderCard key={item.id} provider={item} />)}
						</ApiItem>
					</div>
				</PageContent>
				<PageContent>
					<Tran className="text-xl font-semibold" text="player-connect.room" />
					<Separator />
					<div className="grid grid-cols-[repeat(auto-fill,minmax(min(500px,90vw),1fr))] gap-2">
						<Suspense>
							<ApiItem
								route={api.v4.playerConnects.getRooms}
								queryKey={PLAYER_CONNECTS_ROOMS_QUERY_KEY}
								query={getPlayerConnectRoomQuerySchema}
							>
								{(items) => items.map((item) => <RoomCard key={item.roomId} room={item} />)}
							</ApiItem>
						</Suspense>
					</div>
				</PageContent>
			</ScrollContainer>
		</PageWrapper>
	);
}

function RoomCard({ room }: { room: PlayerConnectRoomWithLink }) {
	const { data, httpAddress, link, name: serverName } = room;
	const { name, createdAt, mapName, isSecured, mods, version, modVersion, locale, players, ping: roomPing } = data;

	const { data: pingNumber } = useQuery({
		queryKey: ['ping', httpAddress],
		queryFn: () => ping(`https://${httpAddress}/ping`),
	});

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(link).then(
			() => {
				toast.success(<Tran text="copied" />, {
					description: link,
				});
			},
			(error) => {
				toast.error(<Tran text="error" />, {
					description: error.message,
				});
			},
		);
	}, [link]);

	return (
		<div
			className="flex cursor-pointer flex-col gap-0.5 rounded-md border bg-card p-2 text-sm"
			role="button"
			onClick={handleCopy}
		>
			<div className="flex items-center gap-1">
				{isSecured && <Lock className="size-5 text-yellow-500" strokeWidth={2} />}
				<ColorText className="text-xl font-semibold" text={name} />
				{pingNumber && <Ping ping={pingNumber + Math.max(roomPing, 0)} />}
			</div>
			<Separator />
			<div>
				<Tran className="font-semibold" text="player-connect.map" />
				{': '}
				<ColorText text={mapName} />
			</div>
			<div>
				<Tran className="font-semibold" text="player-connect.version" />
				{': '}
				<ColorText text={version} />
			</div>
			{modVersion && (
				<div>
					<Tran className="font-semibold" text="player-connect.mod-version" />
					{': '}
					<ColorText text={modVersion} />
				</div>
			)}
			<div>
				<Tran className="font-semibold" text="player-connect.locale" />
				{': '}
				<ColorText text={locale} />
			</div>
			<div className="flex">
				<Tran className="font-semibold" text="player-connect.player" />
				<span className="mr-1">{': '}</span>
				<div className="flex flex-wrap gap-1">
					{players.map((player) => (
						<Badge variant="secondary" key={player.name}>
							<ColorText text={player.name} />
						</Badge>
					))}
				</div>
			</div>
			{mods.length > 0 && (
				<div>
					<Tran className="font-semibold" text="player-connect.mods" />
					{': '}
					<ColorText text={mods.join(', ')} />
				</div>
			)}
			<div>
				<Tran className="font-semibold" text="player-connect.created-at" />
				{': '}
				<RelativeTime className="" date={new Date(createdAt)} />
			</div>
			<div>
				<Tran className="font-semibold" text="player-connect.server" />
				{': '}
				<div>{serverName}</div>
			</div>
		</div>
	);
}

function ProviderCard({ provider }: { provider: PlayerConnectProvider }) {
	const { name, address, httpAddress } = provider;

	const { data, isLoading, isError } = useQuery({
		queryKey: ['ping', httpAddress],
		queryFn: () => ping(`https://${httpAddress}/ping`),
	});

	return (
		<div className="min-h-20 rounded-md border bg-card p-2">
			<div className="flex items-baseline gap-2 font-semibold">
				{isLoading ? <GrayDot /> : isError ? <RedDot /> : <GreenDot />}
				<div>
					<div className="text-xl">{name}</div>
					<span className="text-sm text-muted-foreground">{address}</span>
				</div>
				{data && <Ping ping={data} />}
			</div>
		</div>
	);
}

function Ping({ ping }: { ping: number }) {
	const isTimeout = ping > 10000;
	return (
		<div
			className={cn(
				'flex gap-1 items-center text-sm ml-auto',
				isTimeout ? 'text-red-400' : ping < 200 ? 'text-green-400' : ping < 500 ? 'text-yellow-400' : 'text-red-400',
			)}
		>
			<Signal className="size-4" />
			{isTimeout ? '---' : Math.round(ping)}
			{!isTimeout && 'ms'}
		</div>
	);
}

function GrayDot() {
	return <div className="size-2 shrink-0 animate-pulse rounded-full bg-gray-500"></div>;
}

function GreenDot() {
	return <div className="size-2 shrink-0 rounded-full bg-green-500"></div>;
}

function RedDot() {
	return <div className="size-2 shrink-0 rounded-full bg-red-500"></div>;
}
