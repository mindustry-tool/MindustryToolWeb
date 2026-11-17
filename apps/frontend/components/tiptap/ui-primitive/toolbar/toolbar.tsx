'use client';

import * as React from 'react';
import { Separator } from '@/components/tiptap/ui-primitive/separator';
import { useComposedRef } from '@/hooks/use-composed-ref';
import { useMenuNavigation } from '@/hooks/use-menu-navigation';
import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';

type BaseProps = React.HTMLAttributes<HTMLDivElement>;

type ToolbarProps = {
	variant?: 'floating' | 'fixed'
} & BaseProps

const useToolbarNavigation = (toolbarRef: React.RefObject<HTMLDivElement | null>) => {
	const [items, setItems] = React.useState<HTMLElement[]>([]);

	const collectItems = React.useCallback(() => {
		if (!toolbarRef.current) {
 return [];
}
		return Array.from(
			toolbarRef.current.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])',
			),
		);
	}, [toolbarRef]);

	React.useEffect(() => {
		const toolbar = toolbarRef.current;
		if (!toolbar) {
 return;
}

		const updateItems = () => setItems(collectItems());

		updateItems();
		const observer = new MutationObserver(updateItems);
		observer.observe(toolbar, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, [collectItems, toolbarRef]);

	const { selectedIndex } = useMenuNavigation<HTMLElement>({
		containerRef: toolbarRef,
		items,
		orientation: 'horizontal',
		onSelect: el => el.click(),
		autoSelectFirstItem: false,
	});

	React.useEffect(() => {
		const toolbar = toolbarRef.current;
		if (!toolbar) {
 return;
}

		const handleFocus = (e: FocusEvent) => {
			const target = e.target as HTMLElement;
			if (toolbar.contains(target)) {
 target.setAttribute('data-focus-visible', 'true');
}
		};

		const handleBlur = (e: FocusEvent) => {
			const target = e.target as HTMLElement;
			if (toolbar.contains(target)) {
 target.removeAttribute('data-focus-visible');
}
		};

		toolbar.addEventListener('focus', handleFocus, true);
		toolbar.addEventListener('blur', handleBlur, true);

		return () => {
			toolbar.removeEventListener('focus', handleFocus, true);
			toolbar.removeEventListener('blur', handleBlur, true);
		};
	}, [toolbarRef]);

	React.useEffect(() => {
		if (selectedIndex !== undefined && items[selectedIndex]) {
			items[selectedIndex].focus();
		}
	}, [selectedIndex, items]);
};

export const Toolbar = ({ ref, children, className, ...props }: ToolbarProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const { t } = useI18n();
	const toolbarRef = React.useRef<HTMLDivElement>(null);
	const composedRef = useComposedRef(toolbarRef, ref);
	useToolbarNavigation(toolbarRef);

	return (
		<div
  ref={composedRef}
  role="toolbar"
  aria-label={t('toolbar')}
  className={cn(
				'flex h-12 w-full overflow-x-auto overflow-y-hidden justify-center gap-2 items-center mx-auto text-muted-foreground border-b p-2',
				className,
			)}
  {...props}
		>
			{children}
		</div>
	);
};
Toolbar.displayName = 'Toolbar';

export const ToolbarGroup = ({ ref, children, className, ...props }: BaseProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
	<div ref={ref} role="group" className={cn('flex items-center gap-1', className)} {...props}>
		{children}
	</div>
);
ToolbarGroup.displayName = 'ToolbarGroup';

export const ToolbarSeparator = ({ ref, ...props }: BaseProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
	<Separator className="h-6 w-px shrink-0 bg-border" ref={ref} orientation="vertical" decorative {...props} />
);
ToolbarSeparator.displayName = 'ToolbarSeparator';
