'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

export function CrashStacktrace({ cause, stacktrace }: { cause: string; stacktrace: string }) {
	const { t } = useI18n();

	const handleCopy = () => {
		const full = cause ? `${cause}\n\n${stacktrace}` : stacktrace;
		navigator.clipboard.writeText(full).then(
			() => {
				toast.success(<Tran text="copied" />);
			},
			() => {
				toast.error(<Tran text="copy-failed" />);
			},
		);
	};

	return (
		<div className="flex flex-col gap-2">
			{cause && (
				<div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-1">
					<span className="text-xs font-medium text-muted-foreground">
						<Tran text="root-cause" />
					</span>
					<p className="font-mono text-xs text-destructive font-medium break-all">{cause}</p>
				</div>
			)}

			<div className="relative rounded-md border border-border/60 bg-muted/20 overflow-hidden shadow-xs">
				<div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/40 text-xs text-muted-foreground">
					<span className="font-mono">Stacktrace</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
						onClick={handleCopy}
						aria-label={t('copy-stacktrace')}
						title={t('copy-stacktrace')}
					>
						<Copy className="size-3.5 mr-1" />
						<Tran text="copy" />
					</Button>
				</div>
				<pre className="font-mono py-3 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground select-text">
					{stacktrace}
				</pre>
			</div>
		</div>
	);
}
