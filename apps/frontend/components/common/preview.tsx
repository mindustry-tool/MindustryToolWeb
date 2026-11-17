'use client';

import type { ItemType } from '@mindustry-tool/api';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import ColorText from '@/components/common/color-text';
import FallbackImage from '@/components/common/fallback-image';
import { LocalLink } from '@/components/common/locale-link';
import { Button } from '@/components/ui/button';
import environment from '@/config/environment';
import { cn } from '@/lib/utils';
import ScrollContainer from '@/components/common/scroll-container';
import { cva, VariantProps } from 'class-variance-authority';
import { useMediaQuery } from 'usehooks-ts';
import { Skeleton } from '@/components/ui/skeleton';

type PreviewData = {
	itemId: string;
};

export function PreviewImage({
	className,
	itemType,
	data,
}: {
	className?: string;
	itemType: ItemType;
	data: PreviewData;
}) {
	const itemId = data.itemId;
	return (
		<FallbackImage
			className={cn('aspect-square h-auto w-full rounded-md object-contain bg-black border', className)}
			src={`${environment.url.apiV4}/${itemType}/${itemId}/image.png?variant=preview&format=webp`}
			errorSrc={`${environment.url.apiV4}/${itemType}/${itemId}/image.png`}
			alt=''
			width={320}
			height={320}
		/>
	);
}

export function PreviewHeader({ children }: { children: string }) {
	return (
		<h1 className="overflow-hidden rounded-b-sm text-center text-wrap text-ellipsis absolute bottom-0 left-0 right-0 backdrop-brightness-75 backdrop-blur-sm p-1 m-px">
			<ColorText className="text-wrap" text={children} />
		</h1>
	);
}

export function PreviewLink({
	itemType,
	data,
	children,
}: {
	itemType: ItemType;
	data: PreviewData;
	children: ReactNode;
}) {
	const itemId = data.itemId;
	return (
		<LocalLink className="relative" href={`${itemType}/${itemId}`} itemProp="url">
			{children}
		</LocalLink>
	);
}

export function CommentButton({ itemType, data }: { itemType: ItemType; data: PreviewData & { comments: number } }) {
	const itemId = data.itemId;
	return (
		<Button variant="outline" asChild>
			<LocalLink href={`/${itemType}/${itemId}#comment-section`}>
				<MessageCircle />
				{data.comments}
			</LocalLink>
		</Button>
	);
}

export function PreviewCard({ children }: { children: ReactNode }) {
	return <article className="group relative flex flex-col gap-2 shadow-md">{children}</article>;
}

export function PreviewFooter({ children }: { children: ReactNode }) {
	return <div className="mt-auto flex *:flex-1 gap-2">{children}</div>;
}

const previewsVariants = cva(`relative flex h-full flex-col gap-4 overflow-y-auto scrollbar-gutter-stable`, {
	variants: {
		variant: {
			default: 'p-4',
			user: '',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export function PreviewContainer({
	className,
	children,
	variant,
}: { className?: string; children: ReactNode } & VariantProps<typeof previewsVariants>) {
	return (
		<ScrollContainer className={cn(previewsVariants({ variant, className }))}>
			<Suspense>{children}</Suspense>
		</ScrollContainer>
	);
}

export function PreviewContainerContent({ className, children }: { className?: string; children: ReactNode }) {
	return (
		<section
			className={cn('relative grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] justify-center gap-4', className)}
		>
			{children}
		</section>
	);
}

export function PreviewContainerHeader({ children }: { children: ReactNode }) {
	const [visible, setVisible] = useState(true);
	const [expand, setExpand] = useState(true);
	const lastScroll = useRef(0);
	const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
	const isSmall = useMediaQuery('(max-width: 640px)');

	useEffect(() => {
		const handleScroll = (event: HTMLElementEventMap['scroll']) => {
			const scrollTop = (event.target as HTMLDivElement).scrollTop;
			const visible = scrollTop <= lastScroll.current;

			setExpand(scrollTop < 90);

			if (visible) {
				if (timeout.current) {
					clearTimeout(timeout.current);
				}
				timeout.current = undefined;
				setVisible(true);
			} else {
				if (timeout.current === undefined) {
					timeout.current = setTimeout(() => {
						setVisible(false);
					}, 100);
				}
			}

			lastScroll.current = scrollTop;
		};

		const scrollContainers = document.getElementsByClassName('scroll-container') as HTMLCollectionOf<HTMLDivElement>;

		if (scrollContainers) {
			for (const container of scrollContainers) {
				container.addEventListener('scroll', handleScroll);
				const scrollTop = container.scrollTop;

				// eslint-disable-next-line react-hooks/set-state-in-effect
				setExpand(scrollTop < 90);
			}
		}

		return () => {
			for (const container of scrollContainers) {
				container.removeEventListener('scroll', handleScroll);
			}
		};
	}, []);

	return (
		<div
			className={cn('sticky top-0 z-10 transition-all duration-200 translate-y-0', {
				'opacity-0 -translate-y-10': !visible && isSmall,
				'mx-2': !expand,
			})}
		>
			<div className="flex flex-wrap gap-1 p-1 rounded-md backdrop-blur-xs border bg-card/50">{children}</div>
		</div>
	);
}

export function PreviewContainerFooter({ children }: { children: ReactNode }) {
	const [expand, setExpand] = useState(true);

	useEffect(() => {
		const handleScroll = (event: HTMLElementEventMap['scroll']) => {
			const scrollTop = (event.target as HTMLDivElement).scrollTop;
			const scrollHeight = (event.target as HTMLDivElement).scrollHeight;
			const clientHeight = (event.target as HTMLDivElement).clientHeight;

			setExpand(scrollTop >= scrollHeight - clientHeight - 90);
		};

		const scrollContainers = document.getElementsByClassName('scroll-container') as HTMLCollectionOf<HTMLDivElement>;

		if (scrollContainers) {
			for (const container of scrollContainers) {
				container.addEventListener('scroll', handleScroll);
				const scrollTop = container.scrollTop;
				const scrollHeight = container.scrollHeight;
				const clientHeight = container.clientHeight;

				// eslint-disable-next-line react-hooks/set-state-in-effect
				setExpand(scrollTop >= scrollHeight - clientHeight - 90);
			}
		}

		return () => {
			for (const container of scrollContainers) {
				container.removeEventListener('scroll', handleScroll);
			}
		};
	}, []);

	return (
		<div
			className={cn('sticky bottom-0 mt-auto z-10 transition-all duration-200', {
				'mx-2': !expand,
			})}
		>
			<div className="col-span-full flex items-center justify-between rounded-md border p-1 backdrop-blur-xs bg-card/50">
				{children}
			</div>
		</div>
	);
}

export function PreviewSkeleton({ items }: { items: number }) {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="aspect-square h-auto w-full" />
			<div className="flex gap-2">
				{Array.from({ length: items }).map((_, index) => (
					<Skeleton key={index} className="h-9 w-full" />
				))}
			</div>
		</div>
	);
}
