import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { useScrollRestoration } from '@/hooks/use-scroll-restoration';
import { cn } from '@/lib/utils';

type VirtualizedGridProps<T> = {
	/**
	 * Identifier for scroll restoration to avoid collisions when multiple grids exist
	 */
	id?: string;

	/**
	 * Whether to persist and restore scroll position across navigation. Defaults to true.
	 */
	restoreScroll?: boolean;

	items: T[];

	/**
	 * Minimum width for each item
	 * same as: minmax(256px, 1fr)
	 */
	minItemWidth?: number;

	/**
	 * Grid gap in px
	 */
	gap?: number;

	/**
	 * Overscan rows
	 */
	overscan?: number;

	/**
	 * Optional className for scroll container
	 */
	className?: string;

	/**
	 * Calculate item height based on computed width + item
	 */
	getItemHeight: (args: { item: T; index: number; width: number }) => number;

	/**
	 * Render item
	 */
	children: (args: { item: T; index: number; width: number; height: number }) => ReactNode;
};

type LayoutItem = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export function VirtualizedGrid<T>({
	id,
	restoreScroll = true,
	items,
	children,
	getItemHeight,
	className,
	minItemWidth = 250,
	gap = 16,
	overscan = 1,
}: VirtualizedGridProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);

	const [containerWidth, setContainerWidth] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);

	/*
	 * Resize observer
	 */
	useLayoutEffect(() => {
		const el = containerRef.current;

		if (!el) {
			return;
		}

		const update = () => {
			setContainerWidth(el.clientWidth);
			setViewportHeight(el.clientHeight);
		};

		update();

		const observer = new ResizeObserver(update);

		observer.observe(el);

		return () => {
			observer.disconnect();
		};
	}, []);

	/*
	 * Scroll tracking (throttled via rAF)
	 */
	useEffect(() => {
		const el = containerRef.current;

		if (!el) {
			return;
		}

		let rafId: number;

		const onScroll = () => {
			if (rafId) {
				return;
			}
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				setScrollTop(el.scrollTop);
			});
		};

		el.addEventListener('scroll', onScroll, {
			passive: true,
		});

		return () => {
			el.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(rafId);
		};
	}, []);

	/*
	 * Calculate columns
	 */
	const cols = useMemo(() => {
		if (containerWidth <= 0) {
			return 1;
		}

		return Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
	}, [containerWidth, gap, minItemWidth]);

	/*
	 * Calculate actual width
	 */
	const itemWidth = useMemo(() => {
		if (cols <= 0) {
			return minItemWidth;
		}

		const totalGap = gap * (cols - 1);

		return (containerWidth - totalGap) / cols;
	}, [cols, containerWidth, gap, minItemWidth]);

	/*
	 * Precompute layout
	 */
	const { layout, totalHeight } = useMemo(() => {
		const colHeights = new Array(cols).fill(0);

		const result: LayoutItem[] = [];

		for (let i = 0; i < items.length; i++) {
			/*
			 * Masonry-style shortest column
			 */
			let targetCol = 0;

			for (let c = 1; c < cols; c++) {
				if (colHeights[c] < colHeights[targetCol]) {
					targetCol = c;
				}
			}

			const height = getItemHeight({
				item: items[i]!,
				index: i,
				width: itemWidth,
			});

			const top = colHeights[targetCol];
			const left = targetCol * (itemWidth + gap);

			result.push({
				top,
				left,
				width: itemWidth,
				height,
			});

			colHeights[targetCol] += height + gap;
		}

		return {
			layout: result,
			totalHeight: colHeights.length === 0 ? 0 : Math.max(...colHeights) - gap,
		};
	}, [cols, gap, getItemHeight, itemWidth, items]);

	/*
	 * Visible range
	 */
	const visibleItems = useMemo(() => {
		const topBound = scrollTop - overscan * 400;
		const bottomBound = scrollTop + viewportHeight + overscan * 400;

		const result: Array<{
			item: T;
			index: number;
			layout: LayoutItem;
		}> = [];

		for (let i = 0; i < layout.length; i++) {
			const entry = layout[i]!;

			if (entry.top + entry.height >= topBound && entry.top <= bottomBound) {
				result.push({
					item: items[i]!,
					index: i,
					layout: entry,
				});
			}
		}

		return result;
	}, [items, layout, overscan, scrollTop, viewportHeight]);

	const renderItem = useCallback(
		({ item, index, layout }: { item: T; index: number; layout: LayoutItem }) => {
			const style: CSSProperties = {
				position: 'absolute',
				top: layout.top,
				left: layout.left,
				width: layout.width,
				height: layout.height,
			};

			return (
				<div key={index} style={style}>
					{children({
						item,
						index,
						width: layout.width,
						height: layout.height,
					})}
				</div>
			);
		},
		[children],
	);

	/*
	 * Scroll restoration
	 */
	const isReady = containerWidth > 0 && items.length > 0 && totalHeight > 0;

	useScrollRestoration(containerRef, {
		id,
		enabled: restoreScroll,
		ready: isReady,
		onRestore: (restoredTop) => {
			setScrollTop(restoredTop);
		},
	});

	return (
		<div
			ref={containerRef}
			className={cn('scroll-container', className)}
			style={{
				overflowY: 'auto',
				overflowX: 'hidden',
				scrollbarGutter: 'stable',
				width: '100%',
				height: '100%',
			}}
		>
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: totalHeight,
				}}
			>
				{visibleItems.map(renderItem)}
			</div>
		</div>
	);
}
