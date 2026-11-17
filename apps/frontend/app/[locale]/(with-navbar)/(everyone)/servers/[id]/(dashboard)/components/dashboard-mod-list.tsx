'use client';

import ColorText from '@/components/common/color-text';
import FallbackImage from '@/components/common/fallback-image';
import { Skeletons } from '@/components/common/skeletons';
import { JavaIcon } from '@/components/icons/java-icon';
import { JavascriptIcon } from '@/components/icons/javascript-icon';
import { ApiItem } from '@/components/query/api-item';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { ServerDto, ServerModDto } from '@mindustry-tool/api';
import { Suspense, useMemo } from 'react';

export default function DashboardModList({ server }: { server: ServerDto }) {
	const { id } = server;
	const modsQueryKey = useMemo(() => ['servers', id, 'mods'], [id]);

	return (
		<Suspense>
			<ApiItem
				route={api.v4.servers.mods.getAll}
				queryKey={modsQueryKey}
				params={{ id }}
				loading={() => (
					<Skeletons number={1}>
						<Skeleton className="h-12 w-full" />
					</Skeletons>
				)}
			>
				{(items) => items.map((mod) => <ModCard key={mod.filename} mod={mod} />)}
			</ApiItem>
		</Suspense>
	);
}

function ModCard({ mod }: { mod: ServerModDto }) {
	const type = mod.name === 'PluginLoader' ? 'default' : mod.meta.java ? 'java' : mod.meta.main ? 'javascript' : 'json';

	return (
		<div
			key={mod.filename}
			className={cn('flex items-center gap-1 py-1 px-3 rounded-md bg-card border', {
				'opacity-70': mod.meta.hidden,
			})}
		>
			{mod.meta.repo && (
				<FallbackImage
					width={20}
					height={20}
					className="size-12 shrink-0 overflow-hidden rounded-sm"
					src={`https://raw.githubusercontent.com/${mod.meta.repo}/master/icon.png`}
					errorSrc="https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png"
					alt=""
				/>
			)}
			<ColorText className="font-semibold" text={mod.meta.displayName || mod.name} />
			<span className="text-sm ml-1">
				({mod.meta.version?.startsWith?.('v') ? mod.meta.version : 'v' + mod.meta.version})
			</span>
			<span className="ml-auto">
				{type === 'java' && <JavaIcon className="rounded-xs" />}
				{type === 'javascript' && <JavascriptIcon className="rounded-xs" />}
				{type === 'json' && <Badge variant="secondary">JSON</Badge>}
				{type === 'default' && <Badge variant="default"><Tran text="server.default-badge" /></Badge>}
			</span>
		</div>
	);
}
