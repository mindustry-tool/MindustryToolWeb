'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---
import type { Mark, UseMarkConfig } from './use-mark';

import * as React from 'react';

import { Badge } from '@/components/tiptap/ui-primitive/badge';
import { MARK_SHORTCUT_KEYS, useMark } from './use-mark';

import { Button } from '@/components/ui/button';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

export type MarkButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseMarkConfig

export function MarkShortcutBadge({ type, shortcutKeys = MARK_SHORTCUT_KEYS[type] }: { type: Mark, shortcutKeys?: string }) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling marks in a Tiptap editor.
 *
 * For custom button implementations, use the `useMark` hook instead.
 */
export const MarkButton = (
		{ ref, editor: providedEditor, type, text, hideWhenUnavailable = false, onToggled, showShortcut = false, onClick, children, ...buttonProps }: MarkButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, handleMark, label, canToggle, isActive, Icon, shortcutKeys } = useMark({
			editor,
			type,
			hideWhenUnavailable,
			onToggled,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) {
 return;
}
				handleMark();
			},
			[handleMark, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
  type="button"
  disabled={!canToggle}
  data-style="ghost"
  data-active-state={isActive ? 'on' : 'off'}
  data-disabled={!canToggle}
  role="button"
  tabIndex={-1}
  aria-label={label}
  aria-pressed={isActive}
  tooltip={label}
  onClick={handleClick}
  {...buttonProps}
  ref={ref}
  variant="ghost"
  size="icon"
			>
				{children ?? (
					<>
						<Icon />
						{text && <span className="tiptap-button-text">{text}</span>}
						{showShortcut && <MarkShortcutBadge type={type} shortcutKeys={shortcutKeys} />}
					</>
				)}
			</Button>
		);
	};

MarkButton.displayName = 'MarkButton';
