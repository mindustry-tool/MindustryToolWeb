'use client';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

import type { UseHeadingDropdownMenuConfig } from './use-heading-dropdown-menu';

import * as React from 'react';

// --- Icons ---
import { ChevronDownIcon } from '@/components/icons/chevron-down-icon';
// --- Tiptap UI ---
import { HeadingButton } from '@/components/tiptap/ui/heading-button';
import { useHeadingDropdownMenu } from './use-heading-dropdown-menu';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { useI18n } from '@/i18n/i18n.client';

export type HeadingDropdownMenuProps = {
	/**
	 * Whether to render the dropdown menu in a portal
	 * @default false
	 */
	portal?: boolean;
	/**
	 * Callback for when the dropdown opens or closes
	 */
	onOpenChange?: (isOpen: boolean) => void;
} & Omit<ButtonProps, 'type'> &
	UseHeadingDropdownMenuConfig;

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */

export const HeadingDropdownMenu = ({
	ref,
	editor: providedEditor,
	levels = [1, 2, 3, 4, 5, 6],
	hideWhenUnavailable = false,
	onOpenChange,
	...buttonProps
}: HeadingDropdownMenuProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { editor } = useTiptapEditor(providedEditor);
	const [isOpen, setIsOpen] = React.useState(false);
	const { t } = useI18n('tiptap');
	const { isVisible, isActive, canToggle, Icon } = useHeadingDropdownMenu({
		editor,
		levels,
		hideWhenUnavailable,
	});

	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (!editor || !canToggle) {
				return;
			}
			setIsOpen(open);
			onOpenChange?.(open);
		},
		[canToggle, editor, onOpenChange],
	);

	if (!isVisible) {
		return null;
	}

	return (
		<DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					className="gap-0"
					type="button"
					data-style="ghost"
					data-active-state={isActive ? 'on' : 'off'}
					role="button"
					tabIndex={-1}
					disabled={!canToggle}
					data-disabled={!canToggle}
				aria-label={t('format-as-heading')}
				aria-pressed={isActive}
				tooltip={t('heading')}
					ref={ref}
					variant="ghost"
					size="sm"
					{...buttonProps}
				>
					<Icon />
					<ChevronDownIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="min-w-0" align="start">
				{levels.map((level) => (
					<DropdownMenuItem className="w-full justify-start" key={`heading-${level}`} asChild>
						<HeadingButton editor={editor} level={level} text={`Heading ${level}`} />
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu';

export default HeadingDropdownMenu;
