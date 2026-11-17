'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@mindustry-tool/api';
import { type CrashDto } from '@mindustry-tool/api';

import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { ApiItem } from '@/components/query/api-item';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

import { CrashHeader } from './crash-header';
import { CrashMetadata } from './crash-metadata';
import { CrashMessage } from './crash-message';
import { CrashStacktrace } from './crash-stacktrace';

interface CrashDetailsViewProps {
	initialData?: CrashDto;
}

export function CrashDetailsView({ initialData }: CrashDetailsViewProps) {
	const params = useParams();
	const idParam = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
	const modParam = typeof params?.mod === 'string' ? params.mod : Array.isArray(params?.mod) ? params.mod[0] : '';
	const id = decodeURIComponent(idParam ?? '');
	const mod = decodeURIComponent(modParam ?? '');

	const queryClient = useQueryClient();
	const crashQueryKey = useMemo(() => ['crashes', id], [id]);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusChange = async (status: 'PENDING' | 'RESOLVED') => {
		try {
			setIsUpdating(true);
			await apiInstance.request(api.v4.crashes.update, {
				params: { id },
				body: { status },
			});
			await queryClient.invalidateQueries({ queryKey: crashQueryKey });
			queryClient.invalidateQueries({ queryKey: ['crashes', mod] });
			toast.success(<Tran text="saved" />);
		} catch (error) {
			toast.error(<Tran text="error" />, {
				description: String(error),
			});
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<ApiItem
				route={api.v4.crashes.get}
				params={{ id }}
				queryKey={crashQueryKey}
				initialData={initialData}
			>
				{(item) => {
					const modIdentifier = item.mod || mod;
					const modDisplayName = item.modName || modIdentifier;

					return (
						<>
							<div className="pb-2 border-b border-border/40">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link href="/crashes">
													<Tran text="crashes" />
												</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										{modIdentifier && (
											<>
												<BreadcrumbItem>
													<BreadcrumbLink asChild>
														<Link href={`/crashes/${modIdentifier}`} className="truncate max-w-48">
															{modDisplayName}
														</Link>
													</BreadcrumbLink>
												</BreadcrumbItem>
												<BreadcrumbSeparator />
											</>
										)}
										<BreadcrumbItem>
											<BreadcrumbPage className="font-mono text-xs text-muted-foreground truncate max-w-32">
												#{item.id.slice(0, 8)}
											</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
							</div>

							<ScrollContainer className="flex-1 min-h-0">
								<div className="flex flex-col gap-5 max-w-4xl mx-auto w-full py-1">
									<CrashHeader
										item={item}
										onStatusChange={handleStatusChange}
										isPendingAction={isUpdating}
									/>

									<CrashMetadata item={item} />

									{item.message && (
										<div className="flex flex-col gap-2">
											<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
												<Tran text="diagnostics" />
											</h2>
											<CrashMessage message={item.message} />
										</div>
									)}

									<div className="flex flex-col gap-2">
										<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											<Tran text="stacktrace" />
										</h2>
										<CrashStacktrace cause={item.cause} stacktrace={item.stacktrace} />
									</div>
								</div>
							</ScrollContainer>
						</>
					);
				}}
			</ApiItem>
		</PageWrapper>
	);
}
