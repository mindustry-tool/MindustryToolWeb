'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---
import type { UseColorHighlightConfig } from './use-color-highlight';

import * as React from 'react';

import { Badge } from '@/components/tiptap/ui-primitive/badge';
import { COLOR_HIGHLIGHT_SHORTCUT_KEY, useColorHighlight } from './use-color-highlight';

// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

// --- Styles ---
export type ColorHighlightButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseColorHighlightConfig

export function ColorHighlightShortcutBadge({ shortcutKeys = COLOR_HIGHLIGHT_SHORTCUT_KEY }: { shortcutKeys?: string }) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 */
export const ColorHighlightButton = (
		{ ref, editor: providedEditor, highlightColor, text, hideWhenUnavailable = false, onApplied, showShortcut = false, onClick, children, style, ...buttonProps }: ColorHighlightButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, canColorHighlight, isActive, handleColorHighlight, label, shortcutKeys } = useColorHighlight({
			editor,
			highlightColor,
			label: text || `Toggle highlight (${highlightColor})`,
			hideWhenUnavailable,
			onApplied,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) {
 return;
}
				handleColorHighlight();
			},
			[handleColorHighlight, onClick],
		);

		const buttonStyle = React.useMemo(
			() =>
				({
					...style,
					'--highlight-color': highlightColor,
				} as React.CSSProperties),
			[highlightColor, style],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<button
				className="aspect-square size-9 rounded-md bg-(--highlight-color)"
  type="button"
  data-active-state={isActive ? 'on' : 'off'}
  role="button"
  tabIndex={-1}
  disabled={!canColorHighlight}
  data-disabled={!canColorHighlight}
  aria-label={label}
  aria-pressed={isActive}
  onClick={handleClick}
  style={buttonStyle}
  {...buttonProps}
  ref={ref}
			>
				{children ?? (
					<>
						<span className="tiptap-button-highlight" style={{ '--highlight-color': highlightColor } as React.CSSProperties} />
						{text && <span className="tiptap-button-text">{text}</span>}
						{showShortcut && <ColorHighlightShortcutBadge shortcutKeys={shortcutKeys} />}
					</>
				)}
			</button>
		);
	};

ColorHighlightButton.displayName = 'ColorHighlightButton';
