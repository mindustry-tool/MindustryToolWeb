'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function ScrollIndicator() {
	const [isVisible, setIsVisible] = useState(true);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const parent = ref.current?.parentElement;
		if (!parent) return;

		const handleScroll = () => {
			if (parent.scrollTop > 50) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}
		};

		parent.addEventListener('scroll', handleScroll);
		return () => parent.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div
			ref={ref}
			className={`absolute top-[calc(100vh-6rem)] left-1/2 -translate-x-1/2 p-3 rounded-full bg-white/80 text-primary animate-bounce z-20 md:top-[calc(100vh-8rem)] transition-opacity duration-300 ${
				isVisible ? 'opacity-100' : 'opacity-0'
			}`}
			onClick={() => {
				ref.current?.parentElement?.scrollBy({ top: 1000, behavior: 'smooth' });
			}}
		>
			<ChevronDown className="h-6 w-6" />
		</div>
	);
}
