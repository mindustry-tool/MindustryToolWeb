'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface InfiniteCarouselProps {
	children: ReactNode[];
	speed?: number; // Duration in seconds for one full loop
	className?: string;
	direction?: 'left' | 'right';
}

export default function InfiniteCarousel({
	children,
	speed = 20,
	className = '',
	direction = 'left',
}: InfiniteCarouselProps) {
	const [contentWidth, setContentWidth] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const posRef = useRef(0);

	useEffect(() => {
		if (contentRef.current) {
			setContentWidth(contentRef.current.offsetWidth);
		}
	}, [children]);

	useEffect(() => {
		if (!contentWidth) return;

		let lastTimestamp: number | null = null;
		let animationFrameId: number;

		const loop = (timestamp: number) => {
			if (lastTimestamp === null) {
				lastTimestamp = timestamp;
			}
			const delta = timestamp - lastTimestamp;
			lastTimestamp = timestamp;

			if (!isPaused && trackRef.current) {
				const gap = 24;
				const totalWidth = contentWidth + gap;
				const pixelsPerSecond = totalWidth / speed;
				const moveBy = (pixelsPerSecond * delta) / 1000;

				let currentX = posRef.current;

				if (direction === 'left') {
					currentX += moveBy;
					if (currentX >= 0) {
						currentX = -totalWidth;
					}
				} else {
					currentX -= moveBy;
					if (currentX <= -totalWidth) {
						currentX = 0;
					}
				}

				posRef.current = currentX;
				trackRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`;
			}

			animationFrameId = requestAnimationFrame(loop);
		};

		animationFrameId = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [contentWidth, isPaused, speed, direction]);

	return (
		<div
			className={`overflow-hidden ${className}`}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocus={() => setIsPaused(true)}
			onBlur={() => setIsPaused(false)}
		>
			<div ref={trackRef} className="flex gap-6 w-max will-change-transform">
				<div ref={contentRef} className="flex gap-6 shrink-0">
					{children}
				</div>
				<div className="flex gap-6 shrink-0">{children}</div>
			</div>
		</div>
	);
}
