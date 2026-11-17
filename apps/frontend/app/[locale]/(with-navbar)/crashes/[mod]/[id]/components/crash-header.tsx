'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModIcon } from '@/components/mod/mod-icon';
import { GithubIcon } from '@/components/icons/github-icon';
import { UserAvatar, UserName, UserWithIdComponent } from '@/components/user/user-component';
import { Tran } from '@/i18n/tran';
import type { CrashDto } from '@mindustry-tool/api';

type CrashHeaderProps = {
	item: CrashDto;
	onStatusChange?: (status: 'PENDING' | 'RESOLVED') => void;
	isPendingAction?: boolean;
};

export function CrashHeader({ item, onStatusChange, isPendingAction }: CrashHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
			<div className="flex items-center gap-3 min-w-0">
				<ModIcon
					iconUrl={item.modInfo?.iconUrl}
					name={item.modName || item.mod || ''}
					size={40}
					className="rounded-md"
				/>
				<div className="space-y-0.5 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h1 className="text-lg font-semibold tracking-tight text-foreground">
							<Tran text="crash-report" />
						</h1>
						<Badge
							variant="outline"
							className={
								item.status === 'RESOLVED'
									? 'text-muted-foreground text-xs font-normal'
									: 'border-destructive/30 text-destructive bg-destructive/10 text-xs font-normal'
							}
						>
							<Tran text={item.status === 'RESOLVED' ? 'status-resolved' : 'status-pending'} />
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground font-mono">
						ID: <span>{item.id}</span>
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{item.modInfo?.repo && (
					<Button
						variant="outline"
						size="sm"
						asChild
						className="h-8 text-xs border-border/60 gap-1.5"
					>
						<a
							href={`https://github.com/${item.modInfo.repo}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<GithubIcon className="size-3.5" />
							<Tran text="view-on-github" />
						</a>
					</Button>
				)}

				{item.status === 'RESOLVED' && item.updatedBy && (
					<div className="flex h-8 items-center gap-1.5 text-xs text-muted-foreground border border-border bg-card px-2 py-1 rounded-md">
						<span>
							<Tran text="resolved-by" />:
						</span>
						<UserWithIdComponent userId={item.updatedBy} clickable>
							<div className="flex items-center gap-1 font-medium text-foreground">
								<UserAvatar size={16} />
								<UserName className="text-xs" />
							</div>
						</UserWithIdComponent>
					</div>
				)}

				{onStatusChange && (
					<Button
						size="sm"
						className="h-8 text-xs border-border/60"
						disabled={isPendingAction}
						onClick={() => onStatusChange(item.status === 'PENDING' ? 'RESOLVED' : 'PENDING')}
					>
						<Tran text={item.status === 'PENDING' ? 'mark-resolved' : 'mark-unresolved'} />
					</Button>
				)}
			</div>
		</div>
	);
}
