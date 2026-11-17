'use client';

import type { Editor } from '@tiptap/react';
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---
import type { HighlightColor, UseColorHighlightConfig } from '@/components/tiptap/ui/color-highlight-button';
import * as React from 'react';
// --- Icons ---
import { BanIcon } from '@/components/icons/ban-icon';

import { HighlighterIcon } from '@/components/icons/highlighter-icon';
// --- UI Primitives ---
import { ButtonGroup } from '@/components/tiptap/ui-primitive/button';
import { Card, CardBody, CardItemGroup } from '@/components/tiptap/ui-primitive/card';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/tiptap/ui-primitive/popover';
import { Separator } from '@/components/tiptap/ui-primitive/separator';
import {
	ColorHighlightButton,
	pickHighlightColorsByValue,
	useColorHighlight,
} from '@/components/tiptap/ui/color-highlight-button';
import { Button } from '@/components/ui/button';
// --- Hooks ---
import { useMenuNavigation } from '@/hooks/use-menu-navigation';

import { useIsMobile } from '@/hooks/use-mobile';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { useI18n } from '@/i18n/i18n.client';

export type ColorHighlightPopoverContentProps = {
	/**
	 * The Tiptap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Optional colors to use in the highlight popover.
	 * If not provided, defaults to a predefined set of colors.
	 */
	colors?: HighlightColor[];
};

export type ColorHighlightPopoverProps = {
	/**
	 * Optional colors to use in the highlight popover.
	 * If not provided, defaults to a predefined set of colors.
	 */
	colors?: HighlightColor[];
} & Omit<ButtonProps, 'type'> &
	Pick<UseColorHighlightConfig, 'editor' | 'hideWhenUnavailable' | 'onApplied'>;

export const ColorHighlightPopoverButton = ({
	ref,
	className,
	children,
	...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { t } = useI18n('tiptap');
	return (
		<Button
			type="button"
			className={className}
			data-style="ghost"
			data-appearance="default"
			role="button"
			tabIndex={-1}
			aria-label={t('highlight-text')}
			tooltip={t('highlight')}
			ref={ref}
			variant="ghost"
			size="icon"
			{...props}
		>
			{children ?? <HighlighterIcon />}
		</Button>
	);
};

ColorHighlightPopoverButton.displayName = 'ColorHighlightPopoverButton';

export function ColorHighlightPopoverContent({
	editor,
	colors = pickHighlightColorsByValue(),
}: ColorHighlightPopoverContentProps) {
		const { handleRemoveHighlight } = useColorHighlight({ editor });
	const { t } = useI18n('tiptap');
	const isMobile = useIsMobile();
	const containerRef = React.useRef<HTMLDivElement>(null);

		const menuItems = React.useMemo(() => [...colors, { label: t('remove-highlight'), value: 'none' }], [colors]);

	const { selectedIndex } = useMenuNavigation({
		containerRef,
		items: menuItems,
		orientation: 'both',
		onSelect: (item) => {
			if (!containerRef.current) {
				return false;
			}
			const highlightedElement = containerRef.current.querySelector('[data-highlighted="true"]') as HTMLElement;
			if (highlightedElement) {
				highlightedElement.click();
			}
			if (item.value === 'none') {
				handleRemoveHighlight();
			}
			return false;
		},
		autoSelectFirstItem: false,
	});

	return (
		<Card ref={containerRef} tabIndex={0} style={isMobile ? { boxShadow: 'none', border: 0 } : {}}>
			<CardBody style={isMobile ? { padding: 0 } : {}}>
				<CardItemGroup orientation="horizontal">
					<ButtonGroup className="mt-1 space-x-1" orientation="horizontal">
						{colors.map((color, index) => (
							<ColorHighlightButton
								key={color.value}
								editor={editor}
								highlightColor={color.value}
								tooltip={color.label}
								aria-label={`${color.label} highlight color`}
								tabIndex={index === selectedIndex ? 0 : -1}
								data-highlighted={selectedIndex === index}
							/>
						))}
					</ButtonGroup>
					<Separator />
					<ButtonGroup orientation="horizontal">
						<Button
						onClick={handleRemoveHighlight}
						aria-label={t('remove-highlight')}
						tabIndex={selectedIndex === colors.length ? 0 : -1}
							type="button"
							role="menuitem"
							data-style="ghost"
							data-highlighted={selectedIndex === colors.length}
							variant="ghost"
							size="icon"
						>
							<BanIcon />
						</Button>
					</ButtonGroup>
				</CardItemGroup>
			</CardBody>
		</Card>
	);
}

export function ColorHighlightPopover({
	editor: providedEditor,
	hideWhenUnavailable = false,
	onApplied,
	...props
}: ColorHighlightPopoverProps) {
	const { editor } = useTiptapEditor(providedEditor);
	const { t } = useI18n('tiptap');
	const [isOpen, setIsOpen] = React.useState(false);
	const { isVisible, canColorHighlight, isActive, label, Icon } = useColorHighlight({
		editor,
		hideWhenUnavailable,
		onApplied,
	});

	if (!isVisible) {
		return null;
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<ColorHighlightPopoverButton
					disabled={!canColorHighlight}
					data-active-state={isActive ? 'on' : 'off'}
					data-disabled={!canColorHighlight}
					aria-pressed={isActive}
					aria-label={label}
					tooltip={label}
					{...props}
				>
					<Icon />
				</ColorHighlightPopoverButton>
			</PopoverTrigger>
			<PopoverContent aria-label={t('highlight-colors')}>
				<ColorHighlightPopoverContent editor={editor} />
			</PopoverContent>
		</Popover>
	);
}

export default ColorHighlightPopover;
