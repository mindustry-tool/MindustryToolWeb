'use client';

import type { Editor } from '@tiptap/react';
// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap/ui-primitive/button';

import type { ListType } from '@/components/tiptap/ui/list-button';

import * as React from 'react';

// --- Icons ---
import { ChevronDownIcon } from '@/components/icons/chevron-down-icon';
// --- Tiptap UI ---
import { ListButton } from '@/components/tiptap/ui/list-button';

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
import { useListDropdownMenu } from './use-list-dropdown-menu';

export type ListDropdownMenuProps = {
	/**
	 * The Tiptap editor instance.
	 */
	editor?: Editor;
	/**
	 * The list types to display in the dropdown.
	 */
	types?: ListType[];
	/**
	 * Whether the dropdown should be hidden when no list types are available
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Callback for when the dropdown opens or closes
	 */
	onOpenChange?: (isOpen: boolean) => void;
	/**
	 * Whether to render the dropdown menu in a portal
	 * @default false
	 */
	portal?: boolean;
} & Omit<ButtonProps, 'type'>;

export function ListDropdownMenu({
	editor: providedEditor,
	types = ['bulletList', 'orderedList', 'taskList'],
	hideWhenUnavailable = false,
	onOpenChange,
	...props
}: ListDropdownMenuProps) {
	const { editor } = useTiptapEditor(providedEditor);
	const [isOpen, setIsOpen] = React.useState(false);

	const { t } = useI18n('tiptap');
	const { filteredLists, canToggle, isActive, isVisible, Icon } = useListDropdownMenu({
		editor,
		types,
		hideWhenUnavailable,
	});

	const handleOnOpenChange = React.useCallback(
		(open: boolean) => {
			setIsOpen(open);
			onOpenChange?.(open);
		},
		[onOpenChange],
	);

	return (
		<DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					className="gap-0"
					type="button"
					data-style="ghost"
					data-active-state={isActive ? 'on' : 'off'}
					role="button"
					tabIndex={-1}
					disabled={!canToggle || !isVisible}
					data-disabled={!canToggle}
				aria-label={t('list-options')}
				tooltip={t('list')}
					variant="ghost"
					size="sm"
					{...props}
				>
					<Icon />
					<ChevronDownIcon className="tiptap-button-dropdown-small" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="min-w-0" align="start">
				{filteredLists.map((option) => (
					<DropdownMenuItem className="w-full justify-start" key={option.type} asChild>
						<ListButton editor={editor} type={option.type} text={option.label} />
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ListDropdownMenu;
