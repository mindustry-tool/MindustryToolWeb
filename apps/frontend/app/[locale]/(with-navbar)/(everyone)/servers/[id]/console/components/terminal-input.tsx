'use client';

import { KeyboardEvent, useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { History, Send, Terminal as TerminalIcon } from 'lucide-react';
import { api } from '@mindustry-tool/api';
import { SERVER_STATUSES } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { AutosizeTextarea, type AutosizeTextAreaRef } from '@/components/ui/autoresize-textarea';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';
import { ServerError } from '@/components/server/server-fetch-state';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import NotFoundCard from '@/components/common/not-found-card';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { useTerminalHistory } from './use-terminal-history';
import { useTerminalAutocomplete } from './use-terminal-autocomplete';
import { CommandSignature } from './command-signature';
import { AutocompletePopover } from './autocomplete-popover';
import { HistoryPopover } from './history-popover';

export interface TerminalInputProps {
	serverId: string;
}

export function TerminalInput({ serverId }: TerminalInputProps) {
	const { t } = useI18n('console');
	const { session } = useSession();
	const queryClient = useQueryClient();
	const inputRef = useRef<AutosizeTextAreaRef>(null);

	const [content, setContent] = useState('');
	const [cursor, setCursor] = useState(0);

	const updateCursor = useCallback(() => {
		const pos = inputRef.current?.textArea.selectionStart ?? 0;
		setCursor(pos);
	}, []);

	const history = useTerminalHistory({
		serverId,
		content,
		setContent,
		inputRef,
	});

	const autocomplete = useTerminalAutocomplete({
		serverId,
		content,
		setContent,
		cursor,
		setCursor,
		inputRef,
	});

	const { data: server, isLoading, isError, error } = useServer(serverId);

	const { mutate, isPending } = useMutation({
		mutationFn: (command: string) =>
			apiInstance.request(api.v4.servers.commands.send, {
				params: { id: serverId },
				body: { command: command.trim() },
			}),
		onError: (err) => {
			toast.error(String(err));
			queryClient.invalidateQueries({ queryKey: ['servers', serverId] });
		},
		onSuccess: () => {
			setContent('');
			setCursor(0);
			history.resetHistoryNavigation();
		},
	});

	const isContentValid = content.trim() !== '' && content.length <= 200;

	const handleSend = useCallback(() => {
		if (!isContentValid) {
			return;
		}

		history.addHistory(content);

		if (content.startsWith('/')) {
			mutate(content.slice(1));
			return;
		}

		const username = session?.name ?? 'User';
		mutate(`say [${username}]: ${content}`);
	}, [content, history, isContentValid, mutate, session?.name]);

	const handleParamClick = useCallback(
		(index: number) => {
			const targetArg = autocomplete.parsed.args.find((a) => a.index === index);
			const textarea = inputRef.current?.textArea;
			if (textarea) {
				textarea.focus();
				if (targetArg) {
					textarea.setSelectionRange(targetArg.range[1], targetArg.range[1]);
					setCursor(targetArg.range[1]);
				} else {
					textarea.setSelectionRange(content.length, content.length);
					setCursor(content.length);
				}
			}
		},
		[autocomplete.parsed.args, content.length],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement>) => {
			updateCursor();

			// 1. Tab Key: Autocomplete completion
			if (event.key === 'Tab') {
				event.preventDefault();
				if (autocomplete.isOpen) {
					autocomplete.selectHighlighted();
				}
				return;
			}

			// 2. Escape Key: Dismiss dropdowns
			if (event.key === 'Escape') {
				if (autocomplete.isOpen) {
					event.preventDefault();
					autocomplete.dismiss();
					return;
				}
				if (history.openHistory) {
					event.preventDefault();
					history.setOpenHistory(false);
					return;
				}
			}

			// 3. Arrow Down Key
			if (event.key === 'ArrowDown') {
				if (history.openHistory) {
					event.preventDefault();
					if (history.serverHistories.length > 0) {
						history.setHistoryHighlightIndex((prev) => (prev + 1) % history.serverHistories.length);
					}
					return;
				}

				if (autocomplete.isOpen) {
					event.preventDefault();
					autocomplete.cycleHighlight('next');
					return;
				}

				// Navigate terminal history if single line or at end
				const handled = history.navigateHistory('next');
				if (handled) {
					event.preventDefault();
					return;
				}
			}

			// 4. Arrow Up Key
			if (event.key === 'ArrowUp') {
				if (history.openHistory) {
					event.preventDefault();
					if (history.serverHistories.length > 0) {
						history.setHistoryHighlightIndex(
							(prev) => (prev - 1 + history.serverHistories.length) % history.serverHistories.length,
						);
					}
					return;
				}

				if (autocomplete.isOpen) {
					event.preventDefault();
					autocomplete.cycleHighlight('prev');
					return;
				}

				// Navigate terminal history if single line or at start
				const handled = history.navigateHistory('prev');
				if (handled) {
					event.preventDefault();
					return;
				}
			}

			// 5. Enter Key
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();

				if (history.openHistory) {
					const selected = history.serverHistories[history.historyHighlightIndex];
					if (selected) {
						history.selectHistoryItem(selected);
					}
					return;
				}

				if (autocomplete.isOpen) {
					const accepted = autocomplete.selectHighlighted();
					if (accepted) {
						return;
					}
				}

				handleSend();
			}
		},
		[autocomplete, handleSend, history, updateCursor],
	);

	if (isError) {
		return <ServerError error={error} />;
	}

	if (!server) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				{isLoading ? <LoadingSpinner /> : <NotFoundCard />}
			</div>
		);
	}

	const isServerAvailable = SERVER_STATUSES[server.status] === 'ONLINE' || SERVER_STATUSES[server.status] === 'PAUSED';

	if (!isServerAvailable) {
		return (
			<div className="flex items-center justify-center h-12 w-full rounded-md border">
				<Tran className="text-warning text-center" text="server.not-running" />
			</div>
		);
	}

	return (
		<form
			className="flex flex-col gap-1.5 w-full"
			onSubmit={(event) => {
				event.preventDefault();
				handleSend();
			}}
		>
			<div className="relative flex flex-col w-full border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 shadow-sm">
				{/* Command Signature Hint Bar */}
				<CommandSignature parsed={autocomplete.parsed} onParamClick={handleParamClick} />

				{/* Floating Autocomplete Popover */}
				{!history.openHistory && autocomplete.isOpen && (
					<AutocompletePopover
						suggestions={autocomplete.suggestions}
						highlightedIndex={autocomplete.highlightedIndex}
						onSelect={autocomplete.applySuggestion}
						onHoverIndex={autocomplete.setHighlightedIndex}
					/>
				)}

				{/* Floating History Popover */}
				<HistoryPopover
					histories={history.serverHistories}
					isOpen={history.openHistory}
					highlightedIndex={history.historyHighlightIndex}
					onSelect={history.selectHistoryItem}
					onClose={() => history.setOpenHistory(false)}
					onHoverIndex={history.setHistoryHighlightIndex}
				/>

				<div className="relative flex items-center w-full min-h-10.5 sm:min-h-9.5">
					<AutosizeTextarea
						className="pr-10 border-none shadow-none focus-visible:ring-0 resize-none font-mono text-base sm:text-sm py-2 px-3 leading-relaxed"
						placeholder={t('input-placeholder')}
						ref={inputRef}
						value={content}
						onChange={(event) => {
							setContent(event.currentTarget.value);
							updateCursor();
						}}
						onClick={updateCursor}
						onKeyUp={updateCursor}
						onKeyDown={handleKeyDown}
					/>

					<Button
						type="button"
						className="absolute right-1 top-1/2 -translate-y-1/2 size-8 sm:size-7 p-0 text-muted-foreground hover:text-foreground touch-manipulation cursor-pointer"
						variant="ghost"
						size="icon"
						title="Command History"
						onClick={() => {
							history.setOpenHistory((prev) => !prev);
							autocomplete.dismiss();
						}}
					>
						<History className="size-4" />
					</Button>
				</div>
			</div>

			<div className="flex justify-between items-center px-0.5 gap-2">
				{/* Desktop Shortcuts Hint */}
				<span className="hidden sm:inline-block text-[11px] text-muted-foreground truncate">
					Use <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Tab</kbd> to complete,{' '}
					<kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↑</kbd>{' '}
					<kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↓</kbd> for history,{' '}
					<kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send
				</span>

				{/* Mobile Quick Action Pills */}
				<div className="flex sm:hidden items-center gap-1.5 overflow-x-auto">
					{!content.startsWith('/') && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 text-xs px-2 gap-1 font-mono touch-manipulation cursor-pointer"
							onClick={() => {
								setContent('/');
								setCursor(1);
								setTimeout(() => {
									const textarea = inputRef.current?.textArea;
									if (textarea) {
										textarea.focus();
										textarea.setSelectionRange(1, 1);
									}
								}, 0);
							}}
						>
							<TerminalIcon className="size-3 text-primary" />
							<span><Tran text="console.slash-command-btn" /></span>
						</Button>
					)}
					{autocomplete.isOpen && (
						<span className="text-[10px] text-muted-foreground italic">Tap suggestion to insert</span>
					)}
				</div>

				<Button
					type="submit"
					size="sm"
					disabled={isPending || !isContentValid}
					className="h-8 sm:h-7 px-3 sm:px-2.5 gap-1.5 text-xs ml-auto touch-manipulation cursor-pointer"
				>
					<Send className="size-3" />
					<span><Tran text="send" /></span>
				</Button>
			</div>
		</form>
	);
}
