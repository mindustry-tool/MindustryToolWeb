'use client';

import type { ServerEvent } from '@mindustry-tool/api';
import ColorText from '@/components/common/color-text';
import { cn } from '@/lib/utils';
import React from 'react';

const ServerLogCard = React.memo(({ item }: { item: Omit<ServerEvent<'log'>, 'name'> }) => {
	const { level, createdAt, data } = item;
	const time = new Date(createdAt);
	const today = new Date();

	const isToday =
		time.getDate() === today.getDate() &&
		time.getMonth() === today.getMonth() &&
		time.getFullYear() === today.getFullYear();

	const datePart = `${time.getDate()}-${time.getMonth() + 1}-${time.getFullYear()}`;
	const timePart = `${time
		.getHours()
		.toString()
		.padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time
		.getSeconds()
		.toString()
		.padStart(2, '0')}:${time.getMilliseconds().toString().padStart(3, '0')}`;

	const timeString = isToday ? timePart : `${datePart} ${timePart}`;

	return (
		<div
			className={cn('px-2 py-0.5 flex', {
				'text-[#d95256] bg-[#3c1618]': level === 'error',
				'text-[#cf880a] bg-[#331b00]': level === 'warning',
			})}
		>
			<span className="mr-2 text-nowrap text-muted-foreground">{timeString}</span>
			<ColorText text={data} />
		</div>
	);
});

ServerLogCard.displayName = 'ServerLogCard';

export { ServerLogCard };
