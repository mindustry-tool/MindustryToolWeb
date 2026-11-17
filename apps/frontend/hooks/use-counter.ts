import { useEffect, useState } from 'react';

export function useCounter(from: number, to: number, duration: number = 2): number {
	const [count, setCount] = useState(from);

	useEffect(() => {
		if (from === to) {
			return;
		}

		let startTimestamp: number | null = null;
		let animationFrameId: number;

		const step = (timestamp: number) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const elapsed = (timestamp - startTimestamp) / 1000;
			const progress = Math.min(elapsed / duration, 1);
			const current = Math.floor(from + (to - from) * progress);
			setCount(current);

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(step);
			}
		};

		animationFrameId = requestAnimationFrame(step);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [from, to, duration]);

	return from === to ? to : count;
}
