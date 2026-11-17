'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopyIconButton({ text, label }: { text: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!text) return;
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success(`Copied ${label || 'value'} to clipboard`);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
			title={`Copy ${label || ''}`}
		>
			{copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
		</button>
	);
}
