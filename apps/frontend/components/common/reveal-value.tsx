'use client';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function RevealValue({ value }: { value: string }) {
	const [visible, setVisible] = useState(false);

	return (
		<span className="inline-flex items-center gap-1 min-w-0">
			<span className="font-mono text-sm text-muted-foreground truncate" title={visible ? value : undefined}>
				{visible ? value : '•'.repeat(Math.max(value.length, 1))}
			</span>
			<Button
				variant="ghost"
				size="icon"
				className="size-6 shrink-0"
				type="button"
				aria-label={visible ? 'Hide value' : 'Show value'}
				onClick={() => setVisible((prev) => !prev)}
			>
				{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
			</Button>
		</span>
	);
}