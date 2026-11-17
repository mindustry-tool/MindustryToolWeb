'use client';
import { LocalLink } from '@/components/common/locale-link';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import { api } from '@mindustry-tool/api';
import { ServerDto } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';

export function CreditRemainTime({ server, shouldRun }: { server: ServerDto; shouldRun: boolean }) {
	const { data } = useQuery({
		queryKey: ['servers', server.id],
		queryFn: () =>
			apiInstance.request(api.v4.servers.get, {
				params: {
					id: server.id,
				},
			}),
		refetchInterval: 1000 * 60,
		enabled: shouldRun,
		initialData: server,
	});

	const credit = data ? data.credit : server.credit;

	const totalMinutes = Math.floor(credit);
	const days = Math.floor(totalMinutes / (24 * 60));
	const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
	const minutes = totalMinutes % 60;

	const parts: string[] = [];
	if (days) parts.push(`${days} days`);
	if (hours) parts.push(`${hours} hours`);
	if (minutes) parts.push(`${minutes} minutes`);

	const remainTime = parts.join(' ');

	if (credit <= 0) {
		return (
			<span className="flex gap-2">
				<Tran className="text-destructive" text="server.out-of-credit" />
				<LocalLink href={routes.servers.id({ id: server.id }).credit}>
					<Tran className="text-primary underline" text="server.add-credit" />
				</LocalLink>
			</span>
		);
	}

	return (
		<span
			className={cn({
				'text-warning': credit <= 10,
			})}
		>
			${credit} / {remainTime}
		</span>
	);
}
