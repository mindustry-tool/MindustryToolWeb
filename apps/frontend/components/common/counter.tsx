'use client';

import { useCounter } from '@/hooks/use-counter';

const Counter = ({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) => {
	const rounded = useCounter(from, to, duration);

	return <p>{rounded}</p>;
};

export default Counter;
