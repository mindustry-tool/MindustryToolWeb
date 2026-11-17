'use client';

import type { Editor } from '@tiptap/react';
// --- Tiptap UI ---
import type { UseLinkPopoverConfig } from './use-link-popover';

import * as React from 'react';

// --- Icons ---
import { CornerDownLeftIcon } from '@/components/icons/corner-down-left-icon';
import { ExternalLinkIcon } from '@/components/icons/external-link-icon';
import { LinkIcon } from '@/components/icons/link-icon';
import { TrashIcon } from '@/components/icons/trash-icon';

import { useLinkPopover } from './use-link-popover';
// --- UI Primitives ---
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { useI18n } from '@/i18n/i18n.client';

export type LinkMainProps = {
	/**
	 * The URL to set for the link.
	 */
	url: string;
	/**
	 * Function to update the URL state.
	 */
	setUrl: React.Dispatch<React.SetStateAction<string | null>>;
	/**
	 * Function to set the link in the editor.
	 */
	setLink: () => void;
	/**
	 * Function to remove the link from the editor.
	 */
	removeLink: () => void;
	/**
	 * Function to open the link.
	 */
	openLink: () => void;
	/**
	 * Whether the link is currently active in the editor.
	 */
	isActive: boolean;
};

export type LinkPopoverProps = {
	/**
	 * Callback for when the popover opens or closes.
	 */
	onOpenChange?: (isOpen: boolean) => void;
	/**
	 * Whether to automatically open the popover when a link is active.
	 * @default true
	 */
	autoOpenOnLinkActive?: boolean;
} & Omit<React.ComponentProps<typeof Button>, 'type'> &
	UseLinkPopoverConfig;

/**
 * Link button component for triggering the link popover
 */
export const LinkButton = ({
	ref,
	className,
	children,
	...props
}: React.ComponentProps<typeof Button> & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { t } = useI18n('tiptap');
	return (
		<Button
			type="button"
			className={className}
			data-style="ghost"
			role="button"
			tabIndex={-1}
			aria-label={t('link')}
			ref={ref}
			{...props}
			variant="ghost"
			size="icon"
		>
			{children || <LinkIcon />}
		</Button>
	);
};

LinkButton.displayName = 'LinkButton';

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({ url, setUrl, setLink, removeLink, openLink, isActive }) => {
	const { t } = useI18n('tiptap');
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			setLink();
		}
	};

	return (
		<div className="relative w-100 max-w-full">
			<Input
				className="h-10 py-1"
				type="url"
				placeholder={t('paste-link-placeholder')}
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				onKeyDown={handleKeyDown}
				autoFocus
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="off"
			/>
			<div className="absolute top-0 right-0 bottom-0 z-10 flex items-center gap-0.5 p-0.5">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={setLink}
					title={t('apply-link')}
					disabled={!url && !isActive}
					data-style="ghost"
				>
					<CornerDownLeftIcon />
				</Button>
				<Separator orientation="vertical" />
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={openLink}
					title={t('open-in-new-window')}
					disabled={!url && !isActive}
					data-style="ghost"
				>
					<ExternalLinkIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={removeLink}
					title={t('remove-link')}
					disabled={!url && !isActive}
					data-style="ghost"
				>
					<TrashIcon />
				</Button>
			</div>
		</div>
	);
};

/**
 * Link content component for standalone use
 */
export const LinkContent: React.FC<{
	editor?: Editor | null;
}> = ({ editor }) => {
	const linkPopover = useLinkPopover({
		editor,
	});

	return <LinkMain {...linkPopover} />;
};

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const LinkPopover = ({
	ref,
	editor: providedEditor,
	hideWhenUnavailable = false,
	onSetLink,
	onOpenChange,
	autoOpenOnLinkActive = true,
	onClick,
	children,
	...buttonProps
}: LinkPopoverProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { editor } = useTiptapEditor(providedEditor);
	const [isOpen, setIsOpen] = React.useState(false);

	const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink, openLink, label, Icon } = useLinkPopover({
		editor,
		hideWhenUnavailable,
		onSetLink,
	});

	const handleOnOpenChange = React.useCallback(
		(nextIsOpen: boolean) => {
			setIsOpen(nextIsOpen);
			onOpenChange?.(nextIsOpen);
		},
		[onOpenChange],
	);

	const handleSetLink = React.useCallback(() => {
		setLink();
		setIsOpen(false);
	}, [setLink]);

	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			onClick?.(event);
			if (event.defaultPrevented) {
				return;
			}
			setIsOpen(!isOpen);
		},
		[onClick, isOpen],
	);

	React.useEffect(() => {
		if (autoOpenOnLinkActive && isActive) {
			setIsOpen(true);
		}
	}, [autoOpenOnLinkActive, isActive]);

	return (
		<Popover open={isOpen} onOpenChange={handleOnOpenChange}>
			<PopoverTrigger asChild>
				<LinkButton
					disabled={!canSet || !isVisible}
					data-active-state={isActive ? 'on' : 'off'}
					data-disabled={!canSet}
					aria-label={label}
					aria-pressed={isActive}
					onClick={handleClick}
					{...buttonProps}
					ref={ref}
				>
					{children ?? <Icon />}
				</LinkButton>
			</PopoverTrigger>
			<PopoverContent className="w-fit max-w-none p-0">
				<LinkMain
					url={url}
					setUrl={setUrl}
					setLink={handleSetLink}
					removeLink={removeLink}
					openLink={openLink}
					isActive={isActive}
				/>
			</PopoverContent>
		</Popover>
	);
};

LinkPopover.displayName = 'LinkPopover';

export default LinkPopover;
