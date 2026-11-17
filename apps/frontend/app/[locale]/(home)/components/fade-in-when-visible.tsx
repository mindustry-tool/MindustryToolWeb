'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInWhenVisibleProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
}

export default function FadeInWhenVisible({
	children,
	className,
	delay = 0,
	duration = 0.5,
}: FadeInWhenVisibleProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{ rootMargin: '-50px' },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(className, 'transition-all ease-out')}
			style={{
				transitionDuration: `${duration}s`,
				transitionDelay: `${delay}s`,
				opacity: isInView ? 1 : 0,
				transform: isInView ? 'translateY(0)' : 'translateY(50px)',
			}}
		>
			{children}
		</div>
	);
}
