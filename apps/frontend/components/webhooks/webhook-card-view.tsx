'use client';

import ColorText from '@/components/common/color-text';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import type {
	AnyApiRouteDef,
	RequestBody,
	RequestConfig,
	RequestParams,
	RequestQuery,
} from '@mindustry-tool/api';
import { formatWithParameter } from '@mindustry-tool/api';
import type { ServerWebhookEvent } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import { DiscordEmbedPreview, parseEmbedJson } from './discord-embed-preview';

export function WebhookCardView({
	event,
	url,
	data,
	active = true,
	onActiveChange,
	serverName,
	selectedEvent,
	badge,
	className = 'flex flex-col border rounded-xl p-5 text-sm bg-card gap-4 transition-all hover:border-primary/50 cursor-pointer shadow-lg',
	...props
}: {
	event: string;
	url: string;
	data: string;
	active?: boolean;
	onActiveChange?: (active: boolean) => void;
	serverName: string;
	selectedEvent?: ServerWebhookEvent;
	badge?: ReactNode;
	className?: string;
} & React.ComponentProps<'div'>) {
	const [optimisticActive, setOptimisticActive] = useState(active);

	useEffect(() => {
		setTimeout(() => {
			setOptimisticActive(active);
		}, 0);
	}, [active]);

	const debouncedActiveChange = useDebounceCallback((newActive: boolean) => {
		onActiveChange?.(newActive);
	}, 500);

	const handleToggle = (checked: boolean) => {
		setOptimisticActive(checked);
		debouncedActiveChange(checked);
	};

	const parsedEmbed = parseEmbedJson(data);

	return (
		<div className={className} {...props}>
			{/* Header Row */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2.5">
						<span className="text-base font-bold uppercase tracking-wide">{event}</span>
						<WebhookTarget url={url} />
						{badge}
					</div>
					{selectedEvent?.description && (
						<span className="text-xs text-muted-foreground leading-relaxed">{selectedEvent.description}</span>
					)}
				</div>
				<div
					className="pt-0.5"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onPointerDown={(e) => e.stopPropagation()}
					onPointerUp={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					onMouseUp={(e) => e.stopPropagation()}
				>
					<Switch checked={optimisticActive} onCheckedChange={handleToggle} />
				</div>
			</div>

			{/* Example Preview Section */}
			<div className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-muted-foreground">
					<Tran text="server.webhook-example-data" />
				</span>
				{parsedEmbed ? (
					<DiscordEmbedPreview
						embed={parsedEmbed}
						sampleData={{ ...selectedEvent?.example, serverName }}
					/>
				) : (
					<div className="flex items-start gap-2 bg-secondary/20 border rounded-lg p-3 text-xs">
						<ColorText
							className="whitespace-pre-wrap break-all"
							text={formatWithParameter(data, 'data', { ...selectedEvent?.example, serverName })}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export function WebhookTarget({ url }: { url: string }) {
	if (url.startsWith('https://discord')) {
		return (
			<Badge
				className="bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 border-none font-medium text-[11px] px-2 py-0.5"
				variant="secondary"
			>
				Discord
			</Badge>
		);
	}

	return <Badge variant="destructive"><Tran text="unknown" /></Badge>;
}

export { ParameterHighlight } from './parameter-highlight';

export function useWebhookEvents<T extends AnyApiRouteDef, C extends RequestConfig>(
	queryKey: string[],
	route: T,
	config: C & RequestParams<T> & RequestQuery<T> & RequestBody<T>,
) {
	return useQuery({
		queryKey,
		queryFn: () => apiInstance.request(route, config),
	});
}
