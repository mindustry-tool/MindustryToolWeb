'use client';

import { Suspense, use, useState } from 'react';
import { api } from '@mindustry-tool/api';
import {
	AlertTriangle,
	Check,
	ChevronLeft,
	Copy,
	ExternalLink,
	Eye,
	EyeOff,
	Globe,
	KeyRound,
	RefreshCw,
	ShieldAlert,
	ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { MutateButton } from '@/components/buttons/mutate-button';
import { LocalLink } from '@/components/common/locale-link';
import { PageHeader, PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';
import { ApiItem } from '@/components/query/api-item';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';

export default function Page({ params }: PageProps<'/[locale]/server-managers/[id]'>) {
	const { id } = use(params);

	return (
		<PageWrapper className="gap-3 p-3 sm:p-4">
			<Suspense fallback={<ManagerDetailSkeleton />}>
				<ApiItem
					route={api.v4.servers.managers.get}
					params={{ id }}
					queryKey={['server-manager', id]}
					loading={() => <ManagerDetailSkeleton />}
				>
					{(item) => <ManagerDetailContent id={id} item={item} />}
				</ApiItem>
			</Suspense>
		</PageWrapper>
	);
}

function ManagerDetailContent({
	id,
	item,
}: {
	id: string;
	item: { id: string; name: string; address: string; accessToken: string; securityKey: string };
}) {
	const [showAccessToken, setShowAccessToken] = useState(false);
	const [showSecurityKey, setShowSecurityKey] = useState(false);

	return (
		<div className="flex flex-col h-full overflow-hidden gap-4">
			{/* Page Header */}
			<PageHeader className="justify-between gap-3 pb-3 border-b flex-wrap items-center">
				<div className="flex items-center gap-3">
					<Button asChild variant="outline" size="icon" className="size-9 shrink-0">
						<LocalLink href={routes.serverManagers.value}>
							<ChevronLeft className="size-4" />
						</LocalLink>
					</Button>

					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{item.name}</h1>
							<Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
								<Tran text="server.connected" />
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground font-mono mt-0.5"><Tran text="server.manager-id" /> {id}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
						<LocalLink href={routes.me.servers}>
							<span><Tran text="server.my-servers" /></span>
						</LocalLink>
					</Button>
				</div>
			</PageHeader>

			{/* Main Content (Centered) */}
			<ScrollContainer className="flex-1 min-h-0 items-center">
				<div className="flex flex-col gap-4 max-w-2xl mx-auto w-full py-1">
					{/* Credentials and Endpoint Cards */}
					<div className="grid gap-3">
						{/* Card 1: Address */}
						<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/80 p-4 shadow-xs">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
									<Globe className="size-4 text-primary" />
									<Tran text="server.address" />
								</div>
								<a
									href={item.address}
									target="_blank"
									rel="noreferrer"
									className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono transition-colors"
								>
									<span><Tran text="server.visit" /></span>
									<ExternalLink className="size-3" />
								</a>
							</div>
							<p className="text-xs text-muted-foreground">
								<Tran text="server.address-description" />
							</p>
							<div className="flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-3 py-2 mt-1">
								<span className="font-mono text-xs text-foreground flex-1 break-all select-all">{item.address}</span>
								<CopySecretButton value={item.address} labelKey="server.address-label" />
							</div>
						</div>

						{/* Card 2: Access Token */}
						<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/80 p-4 shadow-xs">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
									<KeyRound className="size-4 text-amber-500" />
									<Tran text="server.access-token" />
								</div>
								<button
									type="button"
									onClick={() => setShowAccessToken(!showAccessToken)}
									className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono transition-colors"
								>
									{showAccessToken ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
									<span>{showAccessToken ? <Tran text="server.hide" /> : <Tran text="server.reveal" />}</span>
								</button>
							</div>
							<p className="text-xs text-muted-foreground">
								<Tran text="server.access-token-description" />
							</p>
							<div className="flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-3 py-2 mt-1">
								<span className="font-mono text-xs text-foreground flex-1 break-all select-all">
									{showAccessToken ? item.accessToken : '••••••••••••••••••••••••••••••••••••••••••••••••'}
								</span>
								<CopySecretButton value={item.accessToken} labelKey="server.access-token-label" />
							</div>
						</div>

						{/* Card 3: Security Key */}
						<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/80 p-4 shadow-xs">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
									<ShieldCheck className="size-4 text-emerald-500" />
									<Tran text="server.security-key" />
								</div>
								<button
									type="button"
									onClick={() => setShowSecurityKey(!showSecurityKey)}
									className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono transition-colors"
								>
									{showSecurityKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
									<span>{showSecurityKey ? <Tran text="server.hide" /> : <Tran text="server.reveal" />}</span>
								</button>
							</div>
							<p className="text-xs text-muted-foreground">
								<Tran text="server.security-key-description" />
							</p>
							<div className="flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-3 py-2 mt-1">
								<span className="font-mono text-xs text-foreground flex-1 break-all select-all">
									{showSecurityKey ? item.securityKey : '••••••••••••••••••••••••••••••••••••••••••••••••'}
								</span>
								<CopySecretButton value={item.securityKey} labelKey="server.security-key-label" />
							</div>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 mt-2">
						<div className="flex items-center gap-2 text-sm font-semibold text-destructive">
							<ShieldAlert className="size-4" />
							<span><Tran text="server.danger-zone" /></span>
						</div>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
							<div className="space-y-0.5">
								<h4 className="text-xs font-semibold text-foreground">
									<Tran text="server.reset-access-token" />
								</h4>
								<p className="text-xs text-muted-foreground max-w-lg">
									<Tran text="server.reset-access-token-description" />
								</p>
							</div>

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="sm" className="h-8 gap-1.5 text-xs shrink-0 self-start sm:self-auto">
										<RefreshCw className="size-3.5" />
										<Tran text="server.reset-access-token" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogTitle className="flex items-center gap-2 text-destructive">
										<AlertTriangle className="size-5" />
										<Tran text="server.reset-access-token" />
									</AlertDialogTitle>
									<AlertDialogDescription>
										<Tran
											text="server.reset-access-token-confirm"
										/>
									</AlertDialogDescription>
									<AlertDialogCancel className="h-8 text-xs">
										<Tran text="cancel" />
									</AlertDialogCancel>
									<AlertDialogAction asChild>
										<MutateButton
											variant="destructive"
											size="sm"
											className="h-8 text-xs gap-1.5"
											mutationKey={['server-manager', id]}
											queryKey={['server-manager', id]}
											mutationFn={() => apiInstance.request(api.v4.servers.managers.reset, { params: { id } })}
										>
											<Tran text="confirm" />
										</MutateButton>
									</AlertDialogAction>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				</div>
			</ScrollContainer>
		</div>
	);
}

function CopySecretButton({ value, labelKey }: { value: string; labelKey: string }) {
	const [copied, setCopied] = useState(false);
	const { t } = useI18n('server');

	const handleCopy = () => {
		navigator.clipboard
			.writeText(value)
			.then(() => {
				setCopied(true);
				toast.success(t('copied-to-clipboard', { label: t(labelKey) }));
				setTimeout(() => setCopied(false), 2000);
			})
			.catch((err) => {
				toast.error(t('copy-failed'), { description: err.message });
			});
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={handleCopy}
			className="size-7 text-muted-foreground hover:text-foreground shrink-0"
			title={t('copy-label', { label: t(labelKey) })}
		>
			{copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
		</Button>
	);
}

function ManagerDetailSkeleton() {
	return (
		<div className="flex flex-col h-full gap-4">
			<div className="flex items-center justify-between pb-3 border-b">
				<div className="flex items-center gap-3">
					<Skeleton className="size-9 rounded-md" />
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-5 w-40 rounded" />
						<Skeleton className="h-3 w-56 rounded" />
					</div>
				</div>
			</div>
			<div className="grid gap-3 max-w-2xl mx-auto w-full py-1">
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-28 rounded-xl" />
				<Skeleton className="h-24 rounded-xl border border-destructive/20" />
			</div>
		</div>
	);
}

