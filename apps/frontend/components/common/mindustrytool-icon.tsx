import Image from 'next/image';
import { cn } from '@/lib/utils';

export const MindustryToolIcon = ({
	className,
	width,
	height,
}: {
	className?: string;
	width?: number;
	height?: number;
}) => (
	<Image
		className={cn('rounded-sm', className)}
		width={width ?? 36}
		height={height ?? 36}
		src="/assets/images/mindustry-tool.png"
		alt="MindustryToolIcon"
		priority
	/>
);
