'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { api } from '@mindustry-tool/api';
import { paginationQuerySchema, type CrashedModDto } from '@mindustry-tool/api';

import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { SearchInput } from '@/components/common/search-input';
import { ModIcon } from '@/components/mod/mod-icon';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';

const CRASHES_MODS_QUERY_KEY = ['crashes', 'mods'];

export default function Page() {
	const { t } = useI18n();
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
				<div>
					<h1 className="text-lg font-semibold tracking-tight text-foreground">
						<Tran text="crashes" />
					</h1>
				</div>
				<div className="w-full sm:w-72">
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={t('search-mods')}
						aria-label={t('search-mods')}
					/>
				</div>
			</div>

			<ScrollContainer className="flex-1 min-h-0">
				<div className="max-w-4xl mx-auto w-full">
					<InfiniteApiItem
						className="flex flex-col gap-2"
						route={api.v4.crashes.findMods}
						query={paginationQuerySchema}
						queryKey={CRASHES_MODS_QUERY_KEY}
						loading={() => <LoadingSpinner />}
						empty={() => (
							<div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-md bg-card/50">
								<p className="text-sm">
									<Tran text="no-crashes" />
								</p>
							</div>
						)}
					>
						{(pages) => {
							const query = searchQuery.trim().toLowerCase();
							const allFiltered = pages.map((page) =>
								page.filter((item: CrashedModDto) => {
									if (!query) return true;
									return (
										item.modName?.toLowerCase().includes(query) ||
										item.mod?.toLowerCase().includes(query) ||
										item.author?.toLowerCase().includes(query) ||
										item.repo?.toLowerCase().includes(query)
									);
								}),
							);

							return allFiltered.map((page) =>
								page.map((item: CrashedModDto) => (
									<Link
										href={`/crashes/${item.mod}`}
										key={item.mod}
										className="group flex items-center justify-between gap-3.5 rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/40 hover:border-border transition-colors text-sm shadow-xs"
									>
										<div className="flex items-center gap-3 min-w-0">
											<ModIcon
												iconUrl={item.iconUrl}
												name={item.modName || item.mod || ''}
												size={42}
											/>
											<div className="flex flex-col min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
														{item.modName || item.mod}
													</span>
													{item.stars != null && item.stars > 0 && (
														<span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground font-mono">
															<Star className="size-3 text-amber-500 fill-amber-500/20" />
															{item.stars}
														</span>
													)}
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
													{item.mod && (
														<span className="font-mono text-muted-foreground/80 truncate">
															{item.mod}
														</span>
													)}
													{item.author && (
														<>
															<span>•</span>
															<span className="truncate">{item.author}</span>
														</>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											{item.pendingCount > 0 ? (
												<Badge
													variant="outline"
													className="border-destructive/30 text-destructive bg-destructive/10 text-xs font-mono"
												>
													{item.pendingCount}
													<span className="ml-1 font-sans">
														<Tran text="status-pending" />
													</span>
												</Badge>
											) : (
												<Badge variant="outline" className="text-muted-foreground text-xs">
													<Tran text="status-resolved" />
												</Badge>
											)}
										</div>
									</Link>
								)),
							);
						}}
					</InfiniteApiItem>
				</div>
			</ScrollContainer>
		</PageWrapper>
	);
}
