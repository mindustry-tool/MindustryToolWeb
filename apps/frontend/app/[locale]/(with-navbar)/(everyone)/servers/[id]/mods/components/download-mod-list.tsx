'use client';

import type { MindustryTag, ReleaseDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { MINDUSTRY_TAGS, modCountSchema, modQuerySchema, paginationQuerySchema } from '@mindustry-tool/api';
import { AlertDialogDescription, AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { Archive, ArrowDownToLine, Calendar, ExternalLink, Lock, RefreshCw, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { MutateButton } from '@/components/buttons/mutate-button';
import ColorText from '@/components/common/color-text';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { ApiPagination } from '@/components/query/api-pagination';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import FallbackImage from '@/components/common/fallback-image';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import ComboBox from '@/components/combo-box/combo-box';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from 'usehooks-ts';
import { useI18n } from '@/i18n/i18n.client';
import { useQueryClient } from '@tanstack/react-query';
import { LocaleDate } from '@/components/common/locale-date';

export default function DownloadModList() {
	const [tag, setTag] = useState<MindustryTag>('mindustry-mod');

	return (
		<Suspense>
			<div className="flex h-full flex-col gap-2 overflow-hidden">
				<div className="flex gap-2 flex-wrap">
					<ComboBox required value={tag} values={MINDUSTRY_TAGS} onChange={setTag} />
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Import Mod</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-3xl max-h-[80dvh]">
							<DialogTitle>Import Mod</DialogTitle>
							<VisuallyHidden>
								<DialogDescription></DialogDescription>
							</VisuallyHidden>
							<ImportDialog />
						</DialogContent>
					</Dialog>
				</div>
				<div className="grid grid-cols-1 gap-2 overflow-y-auto lg:grid-cols-2 2xl:grid-cols-3">
					<ApiItem
						route={api.v4.mods.findAll}
						queryKey={['mods']}
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
											Warming 18+ Content
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
														+{item.topics.length - 5} more
													</Badge>
												)}
											</div>
										)}
									</div>
									<div className="mt-auto flex shrink-0 items-center border-t pt-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-4">
											<span className="flex items-center gap-1" title="Created at">
												<Calendar className="h-3 w-3" />
												<LocaleDate date={new Date(item.created_at)} />
											</span>
											<span className="flex items-center gap-1" title="Updated at">
												<RefreshCw className="h-3 w-3" />
												<LocaleDate date={new Date(item.updated_at)} />
											</span>
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
										<Dialog>
											<DialogTrigger asChild>
												<Button className="ml-auto" variant="outline">
													<Tran text="mod.download" />
												</Button>
											</DialogTrigger>
											<DialogContent className="overflow-hidden flex h-full flex-col w-full">
												<DialogTitle>{item.name}</DialogTitle>
												<VisuallyHidden>
													<DialogDescription />
												</VisuallyHidden>
												<ReleaseDialog
													data={{
														user: item.owner?.login || '',
														repo: item.name || '',
													}}
												/>
											</DialogContent>
										</Dialog>
									</div>
								</div>
							))
						}
					</ApiItem>
				</div>
				<Separator className="mt-auto" />
				<ApiPagination
					className="ml-auto"
					queryKey={['mods']}
					route={api.v4.mods.count}
					query={[{ tag }, modCountSchema]}
				/>
			</div>
		</Suspense>
	);
}

const GITHUB_USERNAME_REPO_REGEX = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;

function ImportDialog() {
	const [input, setInput] = useLocalStorage('import-mod-input', '');
	const [select, setSelect] = useState(false);
	const { t } = useI18n('mod');

	const user = input.trim().match(GITHUB_USERNAME_REPO_REGEX)?.[1];
	const repo = input.trim().match(GITHUB_USERNAME_REPO_REGEX)?.[2];

	const isValid = user && repo;

	if (user && repo && select) {
		return (
			<div className="flex flex-col gap-2">
				<span className="font-bold text-lg">
					{user}/{repo}
				</span>
				<ReleaseDialog data={{ user, repo }} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-muted-foreground">
				Enter the URL of the mod you want to import. The mod must be a GitHub repository with a release.
			</p>
			<Input
				placeholder="Enter mod URL"
				value={input}
				onChange={(event) => setInput(event.target.value)}
				pattern={GITHUB_USERNAME_REPO_REGEX.source}
				title="Enter a valid GitHub repository URL"
			/>
			<div>
				<Button
					onClick={() => {
						if (isValid) {
							setSelect(true);
						} else {
							toast.error(t('mod.import-invalid-url'));
						}
					}}
				>
					Select
				</Button>
			</div>
		</div>
	);
}

function ReleaseDialog({
	data: { user, repo },
}: {
	data: {
		user: string;
		repo: string;
	};
}) {
	return (
		<InfiniteApiItem
			className="flex flex-col h-full overflow-y-auto gap-2"
			route={api.v4.mods.releases.findAll}
			queryKey={['mods', user, repo, 'releases']}
			query={paginationQuerySchema}
			loading={() => <LoadingSpinner />}
			empty={() => <span className="font-semibold flex h-full items-center justify-center text-xl">No release</span>}
			params={{
				owner: user,
				repo: repo,
			}}
		>
			{(items) => items.flatMap((page) => page).map((release) => <ReleaseCard key={release.id} release={release} />)}
		</InfiniteApiItem>
	);
}

function ReleaseCard({ release }: { release: ReleaseDto }) {
	return (
		<div className="rounded-lg border p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<h3 className="text-base font-semibold">{release.name || release.tag_name}</h3>
					<p className="text-xs text-muted-foreground">{release.tag_name}</p>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
				{release.draft && <Badge variant="secondary"><Tran text="mod.release-draft" /></Badge>}
				{release.prerelease && <Badge variant="secondary"><Tran text="mod.release-pre-release" /></Badge>}
				</div>
			</div>

			{release.body && <div className="mt-3 line-clamp-3 text-sm">{release.body}</div>}

			<div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
				<span title="Created at">
					<Calendar className="inline h-3 w-3" /> <LocaleDate date={new Date(release.created_at)} />
				</span>
				{release.published_at && (
					<span title="Published at">
						<RefreshCw className="inline h-3 w-3" /> <LocaleDate date={new Date(release.published_at)} />
					</span>
				)}
			</div>
			{release.assets.length > 0 && (
				<div className="mt-4 space-y-2">
					{release.assets.map((asset) => (
						<div key={asset.id} className="flex items-center justify-between rounded-md border px-3 py-2 bg-card">
							<div className="flex items-center gap-2">
								<Archive className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">{asset.name}</p>
									<p className="text-xs text-muted-foreground">
										{(asset.size / 1024 / 1024).toFixed(2)} MB • {asset.download_count} downloads
									</p>
								</div>
							</div>
							<InstallModButton release={release} asset={asset} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function InstallModButton({ release, asset }: { release: ReleaseDto; asset: ReleaseDto['assets'][number] }) {
	const [open, setOpen] = useState(false);
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="outline">
					<ArrowDownToLine />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="mod.install" />
				</AlertDialogTitle>
				<AlertDialogDescription>
					<ColorText text={release.name || release.tag_name} />
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<MutateButton
							queryKey={['servers', id, 'mods']}
							mutationKey={['servers', id, 'mods']}
							mutationFn={() =>
								apiInstance.request(api.v4.servers.files.install, {
									params: {
										id,
									},
									body: {
										url: asset.url,
										path: `mods/${asset.name}`,
									},
								})
							}
							on={{
								onSuccess: () => {
									toast.success(<Tran text="mod.installed" />, {
										description: release.name,
									});
									setOpen(false);
									queryClient.invalidateQueries({ queryKey: ['releases'], exact: false });
								},
							}}
						>
							<ArrowDownToLine />
							<Tran text="mod.install" />
						</MutateButton>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
