'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

// --- Tiptap UI ---
import type { UseImageUploadConfig } from './use-image-upload';

import * as React from 'react';

import { Badge } from '@/components/tiptap/ui-primitive/badge';
import { IMAGE_UPLOAD_SHORTCUT_KEY, useImageUpload } from './use-image-upload';

import { Button } from '@/components/ui/button';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

export type ImageUploadButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseImageUploadConfig

export function ImageShortcutBadge({ shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY }: { shortcutKeys?: string }) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = (
		{ ref, editor: providedEditor, text, hideWhenUnavailable = false, onInserted, showShortcut = false, onClick, children, ...buttonProps }: ImageUploadButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, canInsert, handleImage, label, isActive, shortcutKeys, Icon } = useImageUpload({
			editor,
			hideWhenUnavailable,
			onInserted,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) {
 return;
}
				handleImage();
			},
			[handleImage, onClick],
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
  disabled={!canInsert}
  data-disabled={!canInsert}
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
						{showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
					</>
				)}
			</Button>
		);
	};

ImageUploadButton.displayName = 'ImageUploadButton';
