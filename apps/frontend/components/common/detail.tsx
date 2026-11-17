import type { ItemType, VerificationStatus as VerificationStatusType } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ExternalLink } from 'lucide-react';
import ColorText from '@/components/common/color-text';
import FallbackImage from '@/components/common/fallback-image';
import JsonDisplay from '@/components/common/json-display';
import { LocaleDate } from '@/components/common/locale-date';
import { ShareCollector } from '@/components/common/share-collector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserWithAvatarAndName, UserWithIdComponent } from '@/components/user/user-component';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

type DetailData = {
	itemId: string;
};

export function Detail({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				'group relative w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto',
				className,
			)}
		>
			<ShareCollector />
			{children}
		</div>
	);
}

export function DetailGrid({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6 items-start', className)}>{children}</div>;
}

export function DetailImage({
	itemType,
	data,
	width,
	height,
	verificationStatus,
	topLeftOverlay,
	topRightOverlay,
	className,
}: {
	itemType: ItemType;
	data: DetailData;
	width?: number;
	height?: number;
	name?: string;
	verificationStatus?: VerificationStatusType;
	topLeftOverlay?: React.ReactNode;
	topRightOverlay?: React.ReactNode;
	className?: string;
}) {
	const itemId = data.itemId;
	return (
		<div className={cn('lg:col-span-7 flex flex-col gap-2 h-full', className)}>
			<div className="relative flex aspect-video w-full h-full min-h-70 sm:min-h-95 lg:min-h-115 items-center justify-center overflow-hidden rounded-lg border border-border bg-black/60 shadow-lg p-3">
				{topLeftOverlay !== undefined ? (
					topLeftOverlay
				) : verificationStatus ? (
					<div className="absolute top-2.5 left-2.5 z-20">
						<VerificationStatusBadge status={verificationStatus} />
					</div>
				) : null}

				<div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
					{width && height ? (
						<span className="rounded border border-border/60 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
							{width} × {height}
						</span>
					) : null}
					{topRightOverlay}
				</div>

				<a
					href={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded border border-border/60 bg-background/80 hover:bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
				>
					<ExternalLink className="size-3" />
					<span>
						<Tran text="full-size" />
					</span>
				</a>

				<FallbackImage
					className="relative z-10 h-full w-full object-contain"
					src={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
					errorSrc={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
					alt=''
					width={(width ?? 10) * 32}
					height={(height ?? 10) * 32}
					unoptimized
				/>
			</div>
		</div>
	);
}

export function DetailInfoSection({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn('lg:col-span-5 flex flex-col gap-3 h-full', className)}>{children}</div>;
}

export function DetailHeader({ children, className }: { children: string; className?: string }) {
	return (
		<h1 className={cn('text-xl sm:text-2xl font-bold tracking-tight text-foreground wrap-break-word', className)}>
			<ColorText text={children} />
		</h1>
	);
}

export function DetailDescription({
	children,
	action,
	className,
}: {
	children?: string | null;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className="space-y-0.5 pt-1">
			<div className="flex items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
				<span>
					<Tran text="description" />
				</span>
				{action}
			</div>
			{children ? (
				<p
					className={cn(
						'text-xs sm:text-sm text-muted-foreground leading-normal whitespace-pre-wrap max-h-32 overflow-y-auto',
						className,
					)}
				>
					<ColorText text={children} />
				</p>
			) : (
				<span className="text-xs text-muted-foreground/50 italic">
					<Tran text="no-description" />
				</span>
			)}
		</div>
	);
}

export function DetailAuthor({
	createdBy,
	createdAt,
	verifierId,
	className,
}: {
	createdBy: string;
	createdAt?: Date | string;
	verifierId?: string | null;
	className?: string;
}) {
	const parsedDate = createdAt ? (typeof createdAt === 'string' ? new Date(createdAt) : createdAt) : undefined;
	return (
		<div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground', className)}>
			<span>•</span>
			<span>
				<Tran text="submitted-by" />
			</span>
			<UserWithIdComponent userId={createdBy}>
				<UserWithAvatarAndName />
			</UserWithIdComponent>
			{verifierId && (
				<>
					<span>•</span>
					<span>
						<Tran text="verified-by" />
					</span>
					<UserWithIdComponent userId={verifierId}>
						<UserWithAvatarAndName />
					</UserWithIdComponent>
				</>
			)}
			{parsedDate && (
				<>
					<span>•</span>
					<LocaleDate date={parsedDate} />
				</>
			)}
		</div>
	);
}

export function DetailSize({
	size,
	className,
}: {
	size: {
		width: number;
		height: number;
	};
	className?: string;
}) {
	return <span className={className}>{`${size.width} × ${size.height}`}</span>;
}

export function DetailStats({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				'grid auto-cols-fr grid-flow-col divide-x divide-border/60 rounded-md border border-border bg-card shadow-lg py-2 text-center',
				className,
			)}
		>
			{children}
		</div>
	);
}

export function DetailStatItem({
	label,
	value,
	subvalue,
	className,
}: {
	label: React.ReactNode;
	value: React.ReactNode;
	subvalue?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn('px-2', className)}>
			<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
			<div className="font-mono text-xs font-semibold text-foreground mt-0.5 truncate">{value}</div>
			{subvalue && <div className="text-[9px] font-mono text-muted-foreground/70">{subvalue}</div>}
		</div>
	);
}

export function DetailStatsLeft({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn('text-[10px] font-mono uppercase tracking-wider text-muted-foreground', className)}>
			{children}
		</div>
	);
}

export function DetailStatsRight({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn('font-mono text-xs font-semibold text-foreground mt-0.5', className)}>{children}</div>;
}

export function DetailSection({
	title,
	children,
	className,
}: {
	title?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn('space-y-1.5 rounded-md border border-border bg-card shadow-lg p-2.5', className)}>
			{title && <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{title}</div>}
			{children}
		</div>
	);
}

export function DetailMetadata({ meta }: { meta: unknown }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="h-7 px-2.5 text-xs gap-1.5" variant="outline" size="sm">
					<ExternalLink className="size-3.5" />
					<Tran text="metadata" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<VisuallyHidden>
					<DialogTitle>Metadata</DialogTitle>
					<DialogDescription>Metadata inspection</DialogDescription>
				</VisuallyHidden>
				<JsonDisplay json={meta} />
			</DialogContent>
		</Dialog>
	);
}

export function DetailFooter({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className="flex justify-end mt-auto">
			<div className={cn('inline-grid grid-flow-col auto-cols-fr gap-1', className)}>{children}</div>
		</div>
	);
}

export function VerificationStatusBadge({ status, className }: { status: VerificationStatusType; className?: string }) {
	return (
		<span
			className={cn(
				'rounded border px-1.5 py-0.5 font-mono text-[10px]',
				status === 'VERIFIED'
					? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
					: status === 'REJECTED'
						? 'border-destructive/30 bg-destructive/10 text-destructive'
						: 'border-border/60 bg-background/90 text-muted-foreground',
				className,
			)}
		>
			{status}
		</span>
	);
}

export const VerificationStatus = VerificationStatusBadge;

export const VerifiedBy = ({ verifiedBy }: { verifiedBy: string }) => {
	return (
		<div className="flex items-center gap-1 text-xs text-muted-foreground">
			<span>
				<Tran text="verified-by" />
			</span>
			<UserWithIdComponent userId={verifiedBy}>
				<UserWithAvatarAndName />
			</UserWithIdComponent>
		</div>
	);
};

export function UploadDetail({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn('relative flex h-full w-full flex-col gap-3', className)}>{children}</div>;
}

export function UploadDetailContent({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn('relative flex h-full w-full flex-col gap-3 overflow-x-hidden overflow-y-auto pr-1', className)}>
			{children}
		</div>
	);
}

export function UploadDetailImage({
	itemType,
	data,
	className,
}: {
	itemType: ItemType;
	data: DetailData;
	className?: string;
}) {
	const itemId = data.itemId;
	return (
		<div
			className={cn(
				'relative flex aspect-video w-full min-h-60 items-center justify-center overflow-hidden rounded-lg border border-border bg-black/60 shadow-lg p-3',
				className,
			)}
		>
			<FallbackImage
				className="relative z-10 h-full w-full object-contain"
				src={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
				errorSrc={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
				alt=''
				width={320}
				height={320}
				unoptimized
			/>
		</div>
	);
}

export * from '@/components/schematic/net-power';
