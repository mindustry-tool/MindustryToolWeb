'use client';

import { api } from '@mindustry-tool/api';
import { MINDUSTRY_TAGS, MindustryTag, modCountSchema, modQuerySchema } from '@mindustry-tool/api';

const MODS_QUERY_KEY = ['mods'];
import { Archive, Calendar, ExternalLink, Lock, RefreshCw, Star } from 'lucide-react';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { useI18n } from '@/i18n/i18n.client';
import FallbackImage from '@/components/common/fallback-image';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ComboBox from '@/components/combo-box/combo-box';
import ScrollContainer from '@/components/common/scroll-container';
import { PageWrapper } from '@/components/common/page-wrapper';
import { LocaleDate } from '@/components/common/locale-date';
import { Tran } from '@/i18n/tran';

export default function Page() {
	const { t } = useI18n('mod');
	const [tag, setTag] = useState<MindustryTag>('mindustry-mod');

	return (
		<Suspense>
			<PageWrapper>
				<h1 className="text-3xl font-bold"><Tran text="mod.title" /></h1>
				<Separator />
				<ComboBox required value={tag} values={MINDUSTRY_TAGS} onChange={setTag} />
				<ScrollContainer className="grid grid-cols-1 gap-2 lg:grid-cols-2 2xl:grid-cols-3 h-fit">
					<ApiItem
						route={api.v4.mods.findAll}
						queryKey={MODS_QUERY_KEY}
						query={[{ tag }, modQuerySchema]}
						loading={() => (
							<Skeletons>
								<Skeleton className="h-80 w-full" />
							</Skeletons>
						)}
					>
						{(items) =>
							items.map((item) => (
								<div
									key={item.id}
									className="relative flex h-full min-h-80 flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md"
								>
									{item.topics?.includes('nsfw') && (
										<div className="absolute inset-0 rounded-xl bg-destructive/20 text-center backdrop-blur-sm">
											<Tran text="mod.nsfw-warning" />
										</div>
									)}
									<div className="mb-2 flex items-start gap-3">
										<FallbackImage
											width={20}
											height={20}
											className="size-12 shrink-0 overflow-hidden rounded-sm"
											src={`https://raw.githubusercontent.com/${item.owner?.login}/${item.name}/master/icon.png`}
											errorSrc="https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png"
											alt=""
										/>
										<div className="flex-1">
											<div className="flex items-start justify-between">
												<h2 className="text-xl leading-none font-bold">{item.name}</h2>
												<div className="flex items-center gap-1 text-yellow-500">
													<Star className="h-4 w-4" />
													<span className="text-sm font-medium">{item.stargazers_count}</span>
												</div>
											</div>
											<p className="mt-1 text-sm text-muted-foreground">{item.full_name}</p>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<p className="line-clamp-3 text-sm">{item.description}</p>

										{item.owner && (
											<div className="flex items-center gap-2">
												<div className="h-8 w-8 overflow-hidden rounded-full">
													<Image
														src={item.owner.avatar_url}
														alt={`${item.owner.login} avatar`}
														height={32}
														width={32}
														className="object-cover"
													/>
												</div>
												<div>
													<p className="flex items-center gap-1 text-sm font-medium">{item.owner.login}</p>
													{item.owner.name && <p className="text-xs text-muted-foreground">{item.owner.name}</p>}
												</div>
											</div>
										)}

										{item.topics && item.topics.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{item.topics.slice(0, 5).map((topic) => (
													<Badge key={topic} variant="secondary" className="text-xs">
														{topic}
													</Badge>
												))}
												{item.topics.length > 5 && (
													<Badge key="more" variant="secondary" className="text-xs">
														+{item.topics.length - 5} {t('more')}
													</Badge>
												)}
											</div>
										)}
									</div>
									<div className="mt-auto flex shrink-0 items-center justify-between border-t pt-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-4">
											<span className="flex items-center gap-1" title="Created at">
												<Calendar className="h-3 w-3" />
												<LocaleDate date={new Date(item.created_at)} />
											</span>
											<span className="flex items-center gap-1" title="Updated at">
												<RefreshCw className="h-3 w-3" />
												<LocaleDate date={new Date(item.updated_at)} />
											</span>
										</div>
										<div className="flex items-center gap-2">
											{item.private && (
												<span className="flex items-center gap-1" title="Private repository">
													<Lock className="h-3 w-3" />
												</span>
											)}
											{item.archived && (
												<span className="flex items-center gap-1" title="Archived repository">
													<Archive className="h-3 w-3" />
												</span>
											)}
											<a
												href={item.html_url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-1 transition-colors hover:text-primary"
												title="View on GitHub"
											>
												<ExternalLink className="h-3 w-3" />
											</a>
										</div>
									</div>
								</div>
							))
						}
					</ApiItem>
				</ScrollContainer>
				<Separator className="mt-auto" />
				<ApiPagination
					className="ml-auto"
					queryKey={MODS_QUERY_KEY}
					route={api.v4.mods.count}
					query={[{ tag }, modCountSchema]}
				/>
			</PageWrapper>
		</Suspense>
	);
}
