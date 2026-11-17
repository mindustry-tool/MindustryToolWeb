'use client';

import { Badge } from '@/components/ui/badge';
import { RelativeTime } from '@/components/common/relative-time';
import type { ReactNode } from 'react';

type ParsedLine =
	| {
			type: 'text';
			content: string;
	  }
	| {
			type: 'kv';
			key: string;
			value: string;
	  };

const KNOWN_PREFIXES = [
	'Version',
	'Date',
	'OS',
	'GL Version',
	'Java Version',
	'Runtime Available Memory',
	'Cores',
	'Mods',
	'Android API level',
	'Likely Cause',
];

const renderValue = (key: string, value: string): ReactNode => {
	switch (key) {
		case 'Mods':
			return (
				<div className="flex flex-wrap gap-1">
					{value.split(',').map((mod, i) => {
						const parts = mod.trim().split(':');
						const name = parts[0];
						const version = parts.slice(1).join(':');

						return (
							<Badge key={i} variant="secondary" className="font-mono text-[11px] px-1.5 py-0.5 border border-border/60">
								<span>{name}</span>
								{version && <span className="text-muted-foreground ml-1">@{version}</span>}
							</Badge>
						);
					})}
				</div>
			);
		case 'Date': {
			try {
				const date = new Date(value);
				if (Number.isNaN(date.getTime())) {
					return <span className="font-mono text-foreground">{value}</span>;
				}
				return (
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-mono text-foreground">{value}</span>
						<span className="text-xs text-muted-foreground">
							(<RelativeTime date={date} />)
						</span>
					</div>
				);
			} catch {
				return <span className="font-mono text-foreground">{value}</span>;
			}
		}
		case 'Runtime Available Memory':
		case 'Cores':
			return <span className="font-mono font-medium text-foreground">{value}</span>;
		case 'GL Version':
			return <span className="font-mono text-xs text-muted-foreground break-all">{value}</span>;
		case 'Version':
			return <span className="font-mono font-medium text-foreground">{value}</span>;
		default:
			return <span className="font-mono text-foreground break-all whitespace-pre-wrap leading-relaxed">{value}</span>;
	}
};

export function CrashMessage({ message }: { message: string }) {
	const lines = message.split('\n').filter((l) => l.trim() !== '');
	const parsed: ParsedLine[] = lines.map((line) => {
		const trimmedLine = line.trim();
		const matchedPrefix = KNOWN_PREFIXES.find((prefix) => trimmedLine.startsWith(`${prefix}:`));

		if (matchedPrefix) {
			const value = trimmedLine.slice(matchedPrefix.length + 1).trim();
			return { type: 'kv', key: matchedPrefix, value };
		}

		return { type: 'text', content: trimmedLine };
	});

	return (
		<div className="rounded-md border border-border/60 bg-card overflow-hidden shadow-xs divide-y divide-border/40">
			{parsed.map((item, idx) => {
				if (item.type === 'kv') {
					return (
						<div
							key={idx}
							className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-3 text-xs sm:text-sm hover:bg-muted/30 transition-colors"
						>
							<span className="font-medium text-muted-foreground select-none sm:col-span-1">{item.key}</span>
							<div className="sm:col-span-2 min-w-0">{renderValue(item.key, item.value)}</div>
						</div>
					);
				}
				return (
					<div
						key={idx}
						className="p-3 text-xs sm:text-sm font-mono whitespace-pre-wrap break-all text-muted-foreground bg-muted/20"
					>
						{item.content}
					</div>
				);
			})}
		</div>
	);
}
