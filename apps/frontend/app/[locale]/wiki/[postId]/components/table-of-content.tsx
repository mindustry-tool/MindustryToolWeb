'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Hydrated } from '@/components/common/hydrated';
import { cn } from '@/lib/utils';

export function TableOfContent() {
	return (
		<div className="sticky top-0 mr-auto hidden h-full max-w-80 min-w-64 flex-col overflow-y-visible p-4 text-sm text-muted-foreground xl:flex">
			<Hydrated>
				<List />
			</Hydrated>
		</div>
	);
}

function List() {
	const content = document.getElementById('content');

	if (!content) {
		throw new Error('#Content not found');
	}

	const lastScrollTop = useRef(0);

	const headings = Array.from(content.querySelectorAll('[data-toc]'));

	const [selectedId, setSelectedId] = useState<string>(headings[0]?.id || '');
	const [cancelScroll, setCancelScroll] = useState(false);

	const handleScroll = useCallback(
		(event: Event) => {
			const target = event.target as HTMLElement;
			const scrollDir = target.scrollTop > lastScrollTop.current ? 'down' : 'up';

			lastScrollTop.current = target.scrollTop;

			if (cancelScroll) {
				setCancelScroll(false);
				return;
			}

			if (scrollDir === 'up') {
				const headingsInViews = headings.filter((heading) => {
					const inViews = heading.getBoundingClientRect().bottom >= 0;
					return inViews;
				});

				const firstHeadingInViews = headingsInViews[0];

				if (firstHeadingInViews) {
					setSelectedId(firstHeadingInViews.id);
				}
			} else {
				const headingsInViews = headings.filter((heading) => {
					const inViews = heading.getBoundingClientRect().top < window.innerHeight;
					return inViews;
				});

				const lastHeadingInViews = headingsInViews[headingsInViews.length - 1];

				if (lastHeadingInViews) {
					setSelectedId(lastHeadingInViews.id);
				}
			}
		},
		[cancelScroll, headings],
	);

	useEffect(() => {
		content.addEventListener('scroll', handleScroll);

		return () => {
			content.removeEventListener('scroll', handleScroll);
		};
	}, [handleScroll, content]);

	const nodes = useMemo(
		() =>
			headings.map((heading) => ({
				level: Number.parseInt(heading.tagName.at(-1) ?? '1'),
				text: heading.textContent || 'Empty',
				id: heading.id,
			})),
		[headings],
	);

	return (
		<>
			<span className="py-1 font-bold text-foreground">ON THIS PAGE</span>
			{nodes.map(({ id, text, level }) => (
				<Link
					className={cn('relative transition-colors py-1', {
						'text-foreground': id === selectedId,
					})}
					href={`#${id}`}
					key={id}
					shallow
					style={{
						paddingLeft: level * 12,
					}}
					onClick={() => {
						setSelectedId(id);
						setCancelScroll(true);
					}}
				>
					<span>{text}</span>
					{id === selectedId && <Anchor />}
					<div className="absolute top-0 bottom-0 left-0 border-l border-muted" />
				</Link>
			))}
		</>
	);
}

function Anchor() {
	return (
		<div className="absolute top-0 bottom-0 left-0 z-50 my-1 border-l-2 border-foreground transition-all duration-150" />
	);
}
