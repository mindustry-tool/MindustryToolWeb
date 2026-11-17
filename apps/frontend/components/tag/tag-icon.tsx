import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function TagIcon({ className, children }: { className?: string; children?: string | null }) {
	if (!children) {
		return undefined;
	}
	return (
		<Image
			loading="lazy"
			className={cn('size-4 shrink-0 overflow-hidden rounded-xs object-cover', className)}
			src={children}
			width={28}
			height={28}
			alt={children}
		/>
	);
}
