'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

import type { UseYoutubeConfig } from './use-youtube';

import * as React from 'react';

import { Badge } from '@/components/tiptap/ui-primitive/badge';
import { useYoutube, YOUTUBE_SHORTCUT_KEY } from './use-youtube';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils';

export type YoutubeButtonProps = {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean
} & Omit<ButtonProps, 'type'> & UseYoutubeConfig

export function YoutubeShortcutBadge({ shortcutKeys = YOUTUBE_SHORTCUT_KEY }: { shortcutKeys?: string }) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for inserting YouTube videos in a Tiptap editor.
 *
 * For custom button implementations, use the `useYoutube` hook instead.
 */
export const YoutubeButton = (
		{ ref, editor: providedEditor, text, hideWhenUnavailable = false, onInserted, showShortcut = false, onClick, children, ...buttonProps }: YoutubeButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> },
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const [isOpen, setIsOpen] = React.useState(false);
		const [url, setUrl] = React.useState('');

		const { t } = useI18n('tiptap');
	const { isVisible, isActive, handleInsert, label, Icon } = useYoutube({
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
				setIsOpen(true);
			},
			[onClick],
		);

		const handleSubmit = React.useCallback(
			(event: React.FormEvent) => {
				event.preventDefault();
				if (url.trim()) {
					handleInsert(url.trim());
					setUrl('');
					setIsOpen(false);
				}
			},
			[url, handleInsert],
		);

		if (!isVisible) {
 return null;
}

		return (
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button ref={ref} aria-label={label} aria-pressed={isActive} onClick={handleClick} variant="ghost" {...buttonProps}>
						{children || (
							<>
								<Icon className="h-4 w-4" />
								{text && <span className="ml-2">{text}</span>}
								{showShortcut && <YoutubeShortcutBadge />}
							</>
						)}
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle><Tran text="insert-youtube-video" /></DialogTitle>
						<DialogDescription><Tran text="enter-youtube-url" /></DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
  type="url"
  placeholder={t('youtube-url-placeholder')}
  value={url}
  onChange={e => setUrl(e.target.value)}
  autoFocus
  required
						/>
						<div className="flex justify-end space-x-2">
							<Button
  type="button"
  variant="outline"
  onClick={() => {
									setUrl('');
									setIsOpen(false);
								}}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={!url.trim()}>
								<Tran text="insert-video" />
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		);
	};

YoutubeButton.displayName = 'YoutubeButton';
