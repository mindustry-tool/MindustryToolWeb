import type { Mode } from './search-bar.types';
import type { SearchQuery } from '@/hooks/use-search-queries';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import TagIcon from '@/components/tag/tag-icon';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';
import { api } from '@mindustry-tool/api';
import { ItemType } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { Skeleton } from '@/components/ui/skeleton';

import { memo } from 'react';

type SearchQueriesProps = {
	query: SearchQuery[];
	itemType?: ItemType;
};

const MODE_COLOR: Record<Mode, string> = {
	author: 'text-pink-400',
	tags: 'text-green-400',
	name: 'text-yellow-400',
	width: 'text-purple-400',
};

function SearchQueriesInner({ query, itemType }: SearchQueriesProps) {
	return query.map((item) =>
		item.mode === 'tags' && itemType ? (
			<TagQueryCard key={`tags-${item.value}`} query={item} itemType={itemType} />
		) : (
			<span
				key={`${item.mode}-${item.value}`}
				className={cn(
					'inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border/60 py-0.5 text-[11px] font-medium transition-colors h-6',
					item.mode === 'author' ? 'pl-1 pr-1.5' : 'px-1.5',
					MODE_COLOR[item.mode],
				)}
			>
				<QueryCard query={item} />
				<button
					type="button"
					className="rounded-xs p-0.5 opacity-70 transition-opacity hover:opacity-100 hover:text-foreground focus:outline-none"
					onClick={(event) => {
						event.stopPropagation();
						item.remove();
					}}
					aria-label={`Remove ${item.mode}`}
				>
					<X className="size-3" />
				</button>
			</span>
		),
	);
}

export const SearchQueries = memo(SearchQueriesInner);

function QueryCard({ query }: { query: SearchQuery }) {
	if (query.mode === 'author') {
		return (
			<UserWithIdComponent userId={String(query.value)} clickable={false}>
				<div className="flex items-center gap-1 cursor-pointer" onClick={query.select}>
					<UserAvatar size={16} />
					<UserName className="text-xs font-medium h-auto" />
				</div>
			</UserWithIdComponent>
		);
	}

	return <span className="text-[11px]">{`${query.mode}: ${query.value}`}</span>;
}

function TagQueryCard({ query, itemType }: { query: SearchQuery; itemType: ItemType }) {
	const { t } = useI18n();
	const { data, isLoading } = useQuery({
		queryKey: ['all-tag', itemType],
		queryFn: () =>
			apiInstance.request(api.v4.tags.findAll, {
				query: {
					group: itemType,
				},
			}),
		staleTime: 1000 * 60 * 10,
	});

	if (isLoading) {
		return <Skeleton className="h-6 w-12 rounded-md" />;
	}

	const selectedTag = data?.flatMap((category) => category.tags).find((tag) => tag.fullTag === query.value);

	if (!selectedTag) {
		return <span className="text-[11px] text-muted-foreground">{String(query.value)}</span>;
	}

	const [, tagName] = (selectedTag.fullTag || '').split('_');

	return (
		<span
			className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors h-6"
		>
			<TagIcon className="size-3.5 shrink-0">{selectedTag.icon}</TagIcon>
			<span className="capitalize">{tagName || selectedTag.name}</span>
			<button
				type="button"
				className="rounded-xs p-0.5 opacity-70 transition-opacity hover:opacity-100 hover:text-foreground focus:outline-none"
				onClick={(event) => {
					event.stopPropagation();
					query.remove();
				}}
				aria-label={t('remove-tag')}
			>
				<X className="size-3" />
			</button>
		</span>
	);
}


export function ModeLabel({ mode }: { mode: Mode | undefined }) {
	if (!mode) {
		return null;
	}

	return (
		<span
			className={cn('flex items-center gap-1 bg-accent border rounded-xl px-3 py-0.5 content-center', MODE_COLOR[mode])}
		>
			<Tran text={`search-bar.${mode}`} asChild />:
		</span>
	);
}
