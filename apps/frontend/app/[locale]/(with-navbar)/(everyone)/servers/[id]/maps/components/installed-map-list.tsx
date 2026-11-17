'use client';

import { api } from '@mindustry-tool/api';
import { ArrowDownToLine, Trash, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
	PreviewCard,
	PreviewFooter,
	PreviewHeader,
	PreviewContainer,
	PreviewContainerContent,
	PreviewSkeleton,
} from '@/components/common/preview';
import { Skeletons } from '@/components/common/skeletons';
import { ApiItem } from '@/components/query/api-item';
import { Button } from '@/components/ui/button';
import environment from '@/config/environment';
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
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import FallbackImage from '@/components/common/fallback-image';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { triggerBlobDownload } from '@/lib/utils';

export function InstalledMapList() {
	const { id } = useParams<{ id: string }>();
	const mapsQueryKey = useMemo(() => ['servers', id, 'maps'], [id]);

	return (
		<div className="flex h-full flex-col gap-2 overflow-hidden">
			<div className="flex">
				<InstallMapButton serverId={id} mapsQueryKey={mapsQueryKey} />
			</div>
			<PreviewContainer className="p-0">
				<PreviewContainerContent>
					<Suspense>
						<ApiItem
							route={api.v4.servers.maps.getAll}
							queryKey={mapsQueryKey}
							params={{ id }}
							loading={() => (
								<Skeletons>
									<PreviewSkeleton items={2} />
								</Skeletons>
							)}
							empty={() => (
								<div className="col-span-full flex h-full w-full justify-center items-center">
									<Tran text="server.no-map-warning" />
								</div>
							)}
						>
							{(items) =>
								items.map((item) => (
									<PreviewCard key={item.filename}>
										<div className="relative">
											<FallbackImage
												className="aspect-square h-auto w-full rounded-md object-contain bg-black border"
												src={`${environment.url.apiV4}/servers/${id}/files?path=${encodeURIComponent(item.filename)}.png`}
												errorSrc="https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png"
												width={320}
												height={320}
												alt=''
											/>
											<PreviewHeader>{item.name}</PreviewHeader>
										</div>
										<PreviewFooter>
											<DownloadMapButton serverId={id} path={item.filename} />
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="outline">
														<Trash />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogTitle>
														<Tran text="map.delete" />
													</AlertDialogTitle>
													<VisuallyHidden>
														<AlertDialogDescription />
													</VisuallyHidden>
													<AlertDialogFooter>
														<AlertDialogCancel>
															<Tran text="common.cancel" />
														</AlertDialogCancel>
														<MutateButton
															queryKey={mapsQueryKey}
															mutationKey={mapsQueryKey}
															mutationFn={() =>
																// TODO: Separate route for deletion
																apiInstance.request(api.v4.servers.files.delete, {
																	params: {
																		id,
																	},
																	query: {
																		path: item.filename,
																	},
																})
															}
															variant="destructive"
														>
															<Trash />
															<Tran text="map.delete" />
														</MutateButton>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</PreviewFooter>
									</PreviewCard>
								))
							}
						</ApiItem>
					</Suspense>
				</PreviewContainerContent>
			</PreviewContainer>
		</div>
	);
}

function DownloadMapButton({ serverId, path }: { path: string; serverId: string }) {
	const handleDownload = useCallback(async () => {
		try {
			const response = await apiInstance.request(api.v4.servers.files.list, {
				params: { id: serverId },
				query: { path },
				responseType: 'raw',
			});

			const blob = await response.blob();
			const filename = path.split('/').filter(Boolean).pop() ?? 'map.msav';
			triggerBlobDownload(blob, filename);
		} catch (error) {
			toast.error(<Tran text="error" />, {
				description: error instanceof Error ? error.message : String(error),
			});
		}
	}, [serverId, path]);

	return (
		<Button variant="outline" onClick={handleDownload}>
			<ArrowDownToLine />
		</Button>
	);
}

function InstallMapButton({ serverId, mapsQueryKey }: { serverId: string; mapsQueryKey: string[] }) {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<Upload />
					<Tran text="map.install" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran text="map.install" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription />
				</VisuallyHidden>
				<div className="flex flex-col gap-2">
					<Input
						type="file"
						accept=".msav"
						onChange={(event) => {
							const selected = event.target.files?.[0];
							if (!selected) {
								setFile(null);
								return;
							}

							if (!selected.name.toLowerCase().endsWith('.msav')) {
								toast.error(
									<Tran text="map.error-invalid-file-extension" />,
								);
								setFile(null);
								return;
							}

							setFile(selected);
						}}
					/>
					<MutateButton
						disabled={!file}
						queryKey={mapsQueryKey}
						mutationKey={['servers', serverId, 'maps', 'install']}
						mutationFn={() => {
							if (!file) {
								throw new Error('No file selected');
							}

							const formData = new FormData();
							formData.append('data', file);

							return apiInstance.request(api.v4.servers.files.write, {
								params: {
									id: serverId,
								},
								query: {
									path: `maps/${file.name}`,
								},
								body: formData,
							});
						}}
						on={{
							onSuccess: () => {
								toast.success(<Tran text="map.installed" />);
								setOpen(false);
							},
						}}
					>
						<Upload />
						<Tran text="map.install" />
					</MutateButton>
				</div>
			</DialogContent>
		</Dialog>
	);
}
