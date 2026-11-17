'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---
import type { Level, UseHeadingConfig } from './use-heading';

import * as React from 'react';
import { Badge } from '@/components/tiptap/ui-primitive/badge';

import { HEADING_SHORTCUT_KEYS, useHeading } from './use-heading';
import { Button } from '@/components/ui/button';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

export type HeadingButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseHeadingConfig

export function HeadingShortcutBadge({
	level,
	shortcutKeys = HEADING_SHORTCUT_KEYS[level],
}: {
	level: Level
	shortcutKeys?: string
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling heading in a Tiptap editor.
 *
 * For custom button implementations, use the `useHeading` hook instead.
 */
export const HeadingButton = (
		{ ref, editor: providedEditor, level, text, hideWhenUnavailable = false, onToggled, showShortcut = false, onClick, children, ...buttonProps }: HeadingButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, canToggle, isActive, handleToggle, label, Icon, shortcutKeys } = useHeading({
			editor,
			level,
			hideWhenUnavailable,
			onToggled,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) {
 return;
}
				handleToggle();
			},
			[handleToggle, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
  type="button"
  data-style="ghost"
  data-active-state={isActive ? 'on' : 'off'}
  role="button"
  tabIndex={-1}
  disabled={!canToggle}
  data-disabled={!canToggle}
  aria-label={label}
  aria-pressed={isActive}
  tooltip={label}
  onClick={handleClick}
  {...buttonProps}
  ref={ref}
  variant="ghost"
			>
				{children ?? (
					<>
						<Icon />
						{text && <span className="tiptap-button-text">{text}</span>}
						{showShortcut && <HeadingShortcutBadge level={level} shortcutKeys={shortcutKeys} />}
					</>
				)}
			</Button>
		);
	};

HeadingButton.displayName = 'HeadingButton';
