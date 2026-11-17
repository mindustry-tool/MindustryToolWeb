'use client';

import type { CrashDto } from '@mindustry-tool/api';
import Link from 'next/link';
import { RelativeTime } from '@/components/common/relative-time';
import { ModIcon } from '@/components/mod/mod-icon';
import { Tran } from '@/i18n/tran';

export function CrashMetadata({ item }: { item: CrashDto }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-card border border-border/60 rounded-lg shadow-xs">
			<div className="space-y-1 min-w-0">
				<span className="text-xs font-medium text-muted-foreground">
					<Tran text="mod" />
				</span>
				<div className="flex items-center gap-2 min-w-0">
					{item.mod ? (
						<>
							<ModIcon
								iconUrl={item.modInfo?.iconUrl}
								name={item.modName || item.mod}
								size={22}
								className="rounded shrink-0"
							/>
							<Link
								href={`/crashes/${item.mod}`}
								className="font-medium truncate text-sm text-foreground hover:text-primary transition-colors"
								title={item.modName || item.mod}
							>
								{item.modName || item.mod}
							</Link>
						</>
					) : (
						<span className="text-muted-foreground text-sm">-</span>
					)}
				</div>
			</div>

			<div className="space-y-1">
				<span className="text-xs font-medium text-muted-foreground">
					<Tran text="occurrences" />
				</span>
				<p className="font-medium text-sm text-foreground">{item.count}</p>
			</div>

			<div className="space-y-1 min-w-0">
				<span className="text-xs font-medium text-muted-foreground">
					<Tran text="first-seen" />
				</span>
				<div className="text-xs text-foreground flex items-center gap-1 flex-wrap">
					<RelativeTime date={new Date(item.createdAt)} />
				</div>
			</div>

			<div className="space-y-1 min-w-0">
				<span className="text-xs font-medium text-muted-foreground">
					<Tran text="last-seen" />
				</span>
				<div className="text-xs text-foreground flex items-center gap-1 flex-wrap">
					{item.updatedAt ? <RelativeTime date={new Date(item.updatedAt)} /> : '-'}
				</div>
			</div>
		</div>
	);
}
