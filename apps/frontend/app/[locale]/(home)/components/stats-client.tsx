'use client';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { useEffect, useRef, useState } from 'react';
import { FileCode, Map, Server } from 'lucide-react';
import { Tran } from '@/i18n/tran';
import FadeInWhenVisible from './fade-in-when-visible';

function useAnimatedCounter(end: number, duration = 2000, delay = 0, shouldStart = false) {
	const [count, setCount] = useState(0);
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		if (!shouldStart) {
			return;
		}

		const timer = setTimeout(() => {
			setHasStarted(true);
		}, delay);

		return () => clearTimeout(timer);
	}, [delay, shouldStart]);

	useEffect(() => {
		if (!hasStarted) {
			return;
		}

		let startTime: number;
		let animationFrame: number;

		const animate = (currentTime: number) => {
			if (!startTime) {
				startTime = currentTime;
			}
			const progress = Math.min((currentTime - startTime) / duration, 1);

			const easeOutQuart = 1 - (1 - progress) ** 4;
			setCount(Math.floor(easeOutQuart * end));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [end, duration, hasStarted]);

	return count;
}

interface StatsClientProps {
	schematicsCount: number;
	mapsCount: number;
	serversCount: number;
}

export default function StatsClient({
	schematicsCount: initialSchematicsCount,
	mapsCount: initialMapsCount,
	serversCount: initialServersCount,
}: StatsClientProps) {
	const [isStatsVisible, setIsStatsVisible] = useState(false);
	const statsRef = useRef<HTMLDivElement>(null);

	const schematicsCount = useAnimatedCounter(initialSchematicsCount, 2000, 200, isStatsVisible);
	const mapsCount = useAnimatedCounter(initialMapsCount, 2000, 400, isStatsVisible);
	const serversCount = useAnimatedCounter(initialServersCount, 2000, 600, isStatsVisible);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsStatsVisible(true);
					}
				});
			},
			{
				threshold: 0.3,
				rootMargin: '0px 0px -100px 0px',
			},
		);

		const ref = statsRef.current;

		if (ref) {
			observer.observe(ref);
		}

		return () => {
			if (ref) {
				observer.unobserve(ref);
			}
		};
	}, []);

	return (
		<div
			ref={statsRef}
			className="container mx-auto px-4 py-16 transition-all duration-1000 sm:px-6 lg:px-8 min-h-100"
		>
			<FadeInWhenVisible className="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<LocalLink
					href={routes.database.schematics.value}
					className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-black/60 hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.5)]"
				>
					<div className="absolute inset-0 bg-linear-to-br from-green-400/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform duration-500">
						<FileCode className="h-8 w-8" />
					</div>
					<div className="mb-2 text-4xl font-bold text-white">{schematicsCount.toLocaleString()}</div>
					<div className="text-lg font-medium text-gray-300 group-hover:text-green-400 transition-colors">
						<Tran text="home.stats-schematics" />
					</div>
				</LocalLink>

				<LocalLink
					href={routes.database.maps.value}
					className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-black/60 hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.5)]"
				>
					<div className="absolute inset-0 bg-linear-to-br from-blue-400/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
						<Map className="h-8 w-8" />
					</div>
					<div className="mb-2 text-4xl font-bold text-white">{mapsCount.toLocaleString()}</div>
					<div className="text-lg font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
						<Tran text="home.stats-maps" />
					</div>
				</LocalLink>

				<LocalLink
					href={routes.servers.value}
					className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-black/60 hover:shadow-[0_0_30px_-5px_rgba(192,132,252,0.5)]"
				>
					<div className="absolute inset-0 bg-linear-to-br from-purple-400/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-500">
						<Server className="h-8 w-8" />
					</div>
					<div className="mb-2 text-4xl font-bold text-white">{serversCount.toLocaleString()}</div>
					<div className="text-lg font-medium text-gray-300 group-hover:text-purple-400 transition-colors">
						<Tran text="home.stats-servers" />
					</div>
				</LocalLink>
			</FadeInWhenVisible>
		</div>
	);
}
