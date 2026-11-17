'use client';

import { api } from '@mindustry-tool/api';
import { ServerModDto } from '@mindustry-tool/api';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { Skeleton } from '@/components/ui/skeleton';
import FallbackImage from '@/components/common/fallback-image';
import ColorText from '@/components/common/color-text';
import { JavaIcon } from '@/components/icons/java-icon';
import { JavascriptIcon } from '@/components/icons/javascript-icon';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MutateButton } from '@/components/buttons/mutate-button';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PLUGINS = ['PluginLoader'];

export function InstalledModList() {
	const { id } = useParams<{ id: string }>();

	return (
		<Suspense>
			<div className="flex flex-col w-full overflow-y-auto h-full gap-2">
				<ApiItem
					route={api.v4.servers.mods.getAll}
					queryKey={['servers', id, 'mods']}
					params={{ id }}
					loading={() => (
						<Skeletons>
							<Skeleton className="h-16.5" />
						</Skeletons>
					)}
					empty={() => <div className="col-span-full text-center text-xl">No mod found</div>}
				>
					{(items) => items.map((item) => <ModCard key={item.filename} serverId={id} mod={item} />)}
				</ApiItem>
			</div>
		</Suspense>
	);
}

function ModCard({ serverId, mod }: { serverId: string; mod: ServerModDto }) {
	const type = DEFAULT_PLUGINS.includes(mod.name)
		? 'default'
		: mod.meta.java
			? 'java'
			: mod.meta.main
				? 'javascript'
				: 'json';

	return (
		<div key={mod.filename} className="flex flex-col gap-1 p-2 rounded-md bg-card border">
			<div className="flex gap-1 items-center">
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
				<ColorText className="font-semibold text-xl" text={mod.meta.displayName || mod.name} />
				<span>({mod.meta.version?.startsWith?.('v') ? mod.meta.version : 'v' + mod.meta.version})</span>
				<div className={cn('ml-auto flex gap-2')}>
					{mod.meta.hidden && <Badge variant="outline"><Tran text="server.hidden-badge" /></Badge>}
					{type === 'java' && <JavaIcon className="size-5 rounded-xs" />}
					{type === 'javascript' && <JavascriptIcon className="size-5 rounded-xs" />}
					{type === 'json' && <Badge variant="secondary">JSON</Badge>}
					{type === 'default' && <Badge variant="default"><Tran text="server.default-badge" /></Badge>}
				</div>
			</div>
			{mod.meta.description && (
				<p className="text-muted-foreground line-clamp-3">
					<ColorText text={mod.meta.description} />
				</p>
			)}
			{type !== 'default' && (
				<div className="mt-4 flex justify-end">
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline">
								<Trash />
								<Tran text="mod.delete" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle>
								<Tran text="mod.delete" />
							</AlertDialogTitle>
							<VisuallyHidden>
								<AlertDialogDescription />
							</VisuallyHidden>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<Tran text="common.cancel" />
								</AlertDialogCancel>
								<MutateButton
									queryKey={['servers', serverId, 'mods']}
									mutationKey={['servers', serverId, 'mods']}
									mutationFn={() =>
										// TODO: Separate route for deletion
										apiInstance.request(api.v4.servers.files.delete, {
											params: {
												id: serverId,
											},
											query: {
												path: mod.filename,
											},
										})
									}
									variant="destructive"
								>
									<Trash />
									<Tran text="mod.delete" />
								</MutateButton>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			)}
		</div>
	);
}
