'use client';

import { Tran } from '@/i18n/tran';

export function TagName({ className, children }: { className?: string; children: string }) {
	return (
		<Tran className={className} text={`tags.${children.toLowerCase()}` as Lowercase<string>} />
	);
}
