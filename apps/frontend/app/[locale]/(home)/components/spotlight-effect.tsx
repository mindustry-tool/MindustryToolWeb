'use client';

import { useEffect, useState } from 'react';

export default function SpotlightEffect() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY + window.scrollY });
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	return (
		<div
			className="pointer-events-none absolute inset-0 z-10"
			style={{
				background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.06), transparent 40%)`,
			}}
		/>
	);
}
