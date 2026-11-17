'use client';

import type { Editor } from '@tiptap/react';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

// --- Icons ---
import { YoutubeIcon } from '@/components/icons/youtube-icon';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

/**
 * Configuration for the YouTube functionality
 */
export type UseYoutubeConfig = {
	/**
	 * The Tiptap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Whether to hide the YouTube button when not available.
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Callback function called when YouTube video is inserted.
	 */
	onInserted?: () => void;
};

/**
 * Shortcut key for YouTube insertion
 */
export const YOUTUBE_SHORTCUT_KEY = 'mod+shift+y';

/**
 * Checks if YouTube can be inserted in the current editor state
 */
export function canInsertYoutube(editor: Editor | null): boolean {
	if (!editor || !editor.isEditable) {
		return false;
	}
	return editor.can().setYoutubeVideo({ src: '' });
}

/**
 * Checks if YouTube is currently active in the editor
 */
export function isYoutubeActive(editor: Editor | null): boolean {
	if (!editor || !editor.isEditable) {
		return false;
	}
	return editor.isActive('youtube');
}

/**
 * Determines if the YouTube button should be visible
 */
export function shouldShowButton({
	editor,
	hideWhenUnavailable,
}: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
}): boolean {
	if (!editor) {
		return false;
	}
	if (hideWhenUnavailable && !canInsertYoutube(editor)) {
		return false;
	}
	return true;
}

/**
 * Inserts a YouTube video into the editor
 */
export function insertYoutube(editor: Editor, url: string): boolean {
	if (!editor || !url) {
		return false;
	}

	try {
		editor.chain().focus().setYoutubeVideo({ src: url }).run();
		return true;
	} catch (error) {
		console.error('Failed to insert YouTube video:', error);
		return false;
	}
}

/**
 * Custom hook that provides YouTube functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleYoutubeButton() {
 *   const { isVisible, handleInsert, isActive } = useYoutube()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         const url = prompt('Enter YouTube URL:')
 *         if (url) handleInsert(url)
 *       }}
 *       aria-pressed={isActive}
 *     >
 *       YouTube
 *     </button>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedYoutubeButton() {
 *   const { isVisible, handleInsert, label, isActive } = useYoutube({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={() => handleInsert('https://youtube.com/watch?v=...')}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       <Icon />
 *       Insert YouTube
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useYoutube(config?: UseYoutubeConfig) {
	const { editor: providedEditor, hideWhenUnavailable = false, onInserted } = config || {};

	const { editor } = useTiptapEditor(providedEditor);
	const isMobile = useIsMobile();
	const [isVisible, setIsVisible] = React.useState<boolean>(true);
	const canInsert = canInsertYoutube(editor);
	const isActive = isYoutubeActive(editor);

	React.useEffect(() => {
		if (!editor) {
			return;
		}

		const handleSelectionUpdate = () => {
			setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
		};

		handleSelectionUpdate();

		editor.on('selectionUpdate', handleSelectionUpdate);

		return () => {
			editor.off('selectionUpdate', handleSelectionUpdate);
		};
	}, [editor, hideWhenUnavailable]);

	const handleInsert = React.useCallback(
		(url: string) => {
			if (!editor || !url) {
				return false;
			}

			const success = insertYoutube(editor, url);
			if (success) {
				onInserted?.();
			}
			return success;
		},
		[editor, onInserted],
	);

	useHotkeys(
		YOUTUBE_SHORTCUT_KEY,
		(event) => {
			event.preventDefault();
			const url = prompt('Enter YouTube URL:');
			if (url) {
				handleInsert(url);
			}
		},
		{
			enabled: isVisible && canInsert,
			enableOnContentEditable: !isMobile,
			enableOnFormTags: true,
		},
	);

	return {
		isVisible,
		isActive,
		handleInsert,
		canInsert,
		label: 'YouTube',
		shortcutKeys: YOUTUBE_SHORTCUT_KEY,
		Icon: YoutubeIcon,
	};
}
