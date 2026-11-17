'use client';

import { api } from '@mindustry-tool/api';
import { paginationQuerySchema } from '@mindustry-tool/api';
import Image from 'next/image';
import { Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RelativeTime } from '@/components/common/relative-time';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { Item } from '@/components/common/item';
import ProtectedRoute from '@/components/layout/protected-route';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tran } from '@/i18n/tran';
import { apiInstance } from '@/config/api';

const MEDIA_QUERY_KEY = ['media'];

function DeleteMediaButton({ mediaId }: { mediaId: string }) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: () =>
			apiInstance.request(api.v4.media.delete, {
				params: { id: mediaId },
			}),
		onSuccess: () => {
			toast.success(<Tran text="delete-success" />);
			queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(<Tran text="delete-fail" />, { description: error.message });
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors absolute top-2 right-2 z-10 backdrop-blur-xs backdrop-brightness-75 bg-background/60 rounded-md border border-border/40"
					onClick={(e) => e.stopPropagation()}
				>
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">
						<Tran text="delete" />
					</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					<Tran text="confirm-delete" />
				</AlertDialogTitle>
				<AlertDialogDescription className="space-y-2 text-sm text-muted-foreground">
					<span>
						<Tran text="moderation.media-delete-confirm" />
					</span>
					<span className="block font-mono text-xs text-muted-foreground/80 break-all bg-muted/40 p-2 rounded border border-border/50">
						ID: {mediaId}
					</span>
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
							<Tran text="delete" />
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default function Page() {
	return (
		<ProtectedRoute filter={{ any: ['god', 'media:delete'] }}>
			<PageWrapper>
				<Suspense>
					<ScrollContainer>
						<InfiniteApiItem
							className="grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-2"
							queryKey={MEDIA_QUERY_KEY}
							route={api.v4.media.get}
							query={paginationQuerySchema}
						>
							{(items) =>
								items
									.flatMap((item) => item)
									.map((item) => (
										<Item key={item.id} className="overflow-hidden relative p-0">
											<DeleteMediaButton mediaId={item.id} />
											<Image
												className="w-full rounded-sm object-contain"
												src={item.url}
												width={128}
												height={128}
												alt={item.id}
											/>
											<UserWithIdComponent userId={item.createdBy}>
												<div className="mt-auto flex gap-2 justify-between items-center pt-2 absolute bottom-0 left-0 p-2 backdrop-blur-xs backdrop-brightness-75 bg-white/10 w-full">
													<div className="flex gap-2 items-center">
														<UserAvatar />
														<UserName />
													</div>
													<RelativeTime date={new Date(item.createdAt)} />
												</div>
											</UserWithIdComponent>
										</Item>
									))
							}
						</InfiniteApiItem>
					</ScrollContainer>
				</Suspense>
			</PageWrapper>
		</ProtectedRoute>
	);
}
