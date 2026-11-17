'use client';

import useSse from '@/hooks/use-sse';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { ServerDto, ServerUsageDto } from '@mindustry-tool/api';
import { useMemo, useState } from 'react';
import { Cpu, MemoryStick } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_DATA_LENGTH = 100;

export default function UsagePanel({
	server: { id, memory: maxRam, cpu: maxCpu },
}: {
	server: Pick<ServerDto, 'id' | 'memory' | 'cpu'>;
}) {
	const [data, setData] = useState<ServerUsageDto[]>([]);

	const maxCpuPercent = maxCpu * 100;
	const maxRamMB = maxRam;

	const currentCpuPercent = data[0]?.cpu || 0;
	const currentRamMB = Math.min(maxRamMB, (data[0]?.ram || 0) / 1024 / 1024);

	const cpuHistory = useMemo(() => data.map((entry) => entry.cpu).reverse(), [data]);
	const ramHistory = useMemo(() => data.map((entry) => entry.ram / 1024 / 1024).reverse(), [data]);

	const cpuUsagePercent = Math.min(currentCpuPercent / maxCpuPercent, 1);
	const ramUsagePercent = Math.min(currentRamMB / maxRamMB, 1);

	useSse({
		route: api.v4.servers.usage,
		params: { id },
		onEvent: (data) => {
			setData((prev) => [data, ...prev].slice(0, MAX_DATA_LENGTH));
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<Tran className="font-semibold" text="server.usage" />
			<div className="grid gap-2 sm:grid-cols-2">
				<UsageCard
					icon={<Cpu className="size-4" />}
					label={<Tran text="server.cpu" />}
					value={`${currentCpuPercent.toFixed(2)}%`}
					total={`of ${maxCpuPercent}%`}
					percent={cpuUsagePercent}
					history={cpuHistory}
				/>
				<UsageCard
					icon={<MemoryStick className="size-4" />}
					label={<Tran text="server.ram" />}
					value={`${currentRamMB.toFixed(2)}MB`}
					total={`of ${maxRamMB}MB`}
					percent={ramUsagePercent}
					history={ramHistory}
				/>
			</div>
		</div>
	);
}

function UsageCard({
	icon,
	label,
	value,
	total,
	percent,
	history,
}: {
	icon: React.ReactNode;
	label: React.ReactNode;
	value: string;
	total: string;
	percent: number;
	history: number[];
}) {
	const roundedPercent = Math.min(100, percent * 100);

	return (
		<div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-lg">
			<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
				{icon}
				{label}
				<span className="ml-auto font-semibold text-foreground">
					{value} <span className="text-xs font-normal text-muted-foreground">{total}</span>
				</span>
			</div>
			<Sparkline data={history} className={lineColor(roundedPercent)} />
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					className={cn('h-full rounded-full transition-[width] duration-300 ease-in-out', barColor(roundedPercent))}
					style={{ width: `${roundedPercent}%` }}
				/>
			</div>
		</div>
	);
}

function barColor(percent: number) {
	return percent < 70 ? 'bg-emerald-500' : percent < 85 ? 'bg-yellow-500' : 'bg-red-500';
}

function lineColor(percent: number) {
	return percent < 70 ? 'text-emerald-500' : percent < 85 ? 'text-yellow-500' : 'text-red-500';
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
	if (data.length < 2) {
		return <div className="h-8" />;
	}

	const max = Math.max(...data, 0.000001);
	const step = 100 / (data.length - 1);
	const points = data.map((value, index) => `${index * step},${30 - (value / max) * 26 - 2}`).join(' ');

	return (
		<svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-8 w-full">
			<polyline points={`0,30 ${points} 100,30`} className={cn('fill-current opacity-10', className)} strokeWidth={0} />
			<polyline
				points={points}
				fill="none"
				strokeWidth={1.5}
				vectorEffect="non-scaling-stroke"
				className={cn('stroke-current', className)}
			/>
		</svg>
	);
}
