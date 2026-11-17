'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import environment from '@/config/environment';
import FallbackImage from '@/components/common/fallback-image';
import Image from 'next/image';

const REFRESH_INTERVAL = 60000;

export default function CurrentMapImage({ server }: { server: Pick<ServerDto, 'id' | 'name'> }) {
	const { id } = server;
	const [key, setKey] = useState(() => Date.now());
	const [lastKey, setLastKey] = useState(0);

	useInterval(() => {
		setLastKey(key);
		setKey(Date.now());
	}, REFRESH_INTERVAL);

	return (
		<div className="relative flex max-w-lg h-auto w-[max(128px,30vw)]">
			<div className="absolute top-1 left-1 z-20">
				<Loader time={key} />
			</div>
			<FallbackImage
				key={lastKey}
				className="h-auto rounded-lg z-0 w-auto max-h-dvh"
				src={`${environment.url.apiV4}/servers/${id}/image?key=${lastKey}`}
				errorSrc="https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png"
				alt=""
				width={256}
				height={256}
				priority
			/>
			<Image
				key={key}
				className="h-auto rounded-lg absolute top-0 left-0 z-10 border-none w-auto max-h-dvh"
				src={`${environment.url.apiV4}/servers/${id}/image?key=${key}`}
				alt=""
				width={256}
				height={256}
				priority
			/>
		</div>
	);
}

function Loader({ time }: { time: number }) {
	const [progress, setProgress] = useState(0);

	useInterval(() => {
		const nextRefresh = time + REFRESH_INTERVAL;

		setProgress(1 - (nextRefresh - Date.now()) / REFRESH_INTERVAL);
	}, 2);

	const radius = 10;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - progress * circumference;

	return (
		<svg className="h-6 w-6 -rotate-90 transform" viewBox="0 0 25 25">
			<circle cx="12" cy="12" r={radius} stroke="gray" strokeWidth="2" fill="none" opacity="0.2" />
			<circle
				cx="12"
				cy="12"
				r={radius}
				stroke="white"
				strokeWidth="2"
				fill="none"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				strokeLinecap="round"
				style={{ transition: 'stroke-dashoffset 0.1s linear' }}
			/>
		</svg>
	);
}
