import { SERVER_STATUSES } from '@mindustry-tool/api';
import { AlertTriangleIcon, Square, WifiIcon, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

type Props = {
	status: number;
	className?: string;
};

export default function ServerStatusBadge({ status, className }: Props) {
	const value = SERVER_STATUSES[status];

	switch (value) {
		case 'ONLINE':
		case 'PAUSED':
			return (
				<Badge className={cn('gap-1 text-xs', className)} variant="success">
					<WifiIcon className="size-3" />
					<Tran text="server.online" />
				</Badge>
			);
		case 'OFFLINE':
			return (
				<Badge className={cn('gap-1 text-xs', className)} variant="destructive">
					<WifiOff className="size-3" />
					<Tran text="server.offline" />
				</Badge>
			);
		case 'STOP':
			return (
				<Badge className={cn('gap-1 text-xs', className)} variant="warning">
					<Square className="size-3" />
					<Tran text="server.stop" />
				</Badge>
			);
		default:
			return (
				<Badge className={cn('gap-1 text-xs', className)} variant="warning">
					<AlertTriangleIcon className="size-3" />
					<span>{value}</span>
				</Badge>
			);
	}
}
