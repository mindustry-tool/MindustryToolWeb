'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---

import type {
	UseBlockquoteConfig,
} from './use-blockquote';

import * as React from 'react';

import { Badge } from '@/components/tiptap/ui-primitive/badge';
import {
	BLOCKQUOTE_SHORTCUT_KEY,
	useBlockquote,
} from './use-blockquote';
import { Button } from '@/components/ui/button';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

export type BlockquoteButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseBlockquoteConfig

export function BlockquoteShortcutBadge({ shortcutKeys = BLOCKQUOTE_SHORTCUT_KEY }: { shortcutKeys?: string }) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling blockquote in a Tiptap editor.
 *
 * For custom button implementations, use the `useBlockquote` hook instead.
 */
export const BlockquoteButton = (
		{ ref, editor: providedEditor, text, hideWhenUnavailable = false, onToggled, showShortcut = false, onClick, children, ...buttonProps }: BlockquoteButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, canToggle, isActive, handleToggle, label, shortcutKeys, Icon } = useBlockquote({
			editor,
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
  tooltip="Blockquote"
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
						{showShortcut && <BlockquoteShortcutBadge shortcutKeys={shortcutKeys} />}
					</>
				)}
			</Button>
		);
	};

BlockquoteButton.displayName = 'BlockquoteButton';
