'use client';

import { RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import type { AutosizeTextAreaRef } from '@/components/ui/autoresize-textarea';

const MAX_HISTORY_PERSIST = 50;

export interface UseTerminalHistoryProps {
	serverId: string;
	content: string;
	setContent: (value: string) => void;
	inputRef: RefObject<AutosizeTextAreaRef | null>;
}

export function useTerminalHistory({ serverId, content, setContent, inputRef }: UseTerminalHistoryProps) {
	const historyKey = `server-${serverId}-console`;
	const [histories, setHistories] = useLocalStorage<Record<string, string[]>>('input-histories', {});
	const serverHistories = useMemo(() => histories[historyKey] ?? [], [histories, historyKey]);

	// historyIndex: null means user is at current draft; 0 means most recent history item
	const [historyIndex, setHistoryIndex] = useState<number | null>(null);
	const draftRef = useRef<string>('');

	// Dropdown history modal / popup
	const [openHistory, setOpenHistory] = useState(false);
	const [historyHighlightIndex, setHistoryHighlightIndex] = useState(0);

	const moveCursorToEnd = useCallback(() => {
		setTimeout(() => {
			const textarea = inputRef.current?.textArea;
			if (textarea) {
				const len = textarea.value.length;
				textarea.setSelectionRange(len, len);
			}
		}, 0);
	}, [inputRef]);

	const navigateHistory = useCallback(
		(direction: 'prev' | 'next'): boolean => {
			if (serverHistories.length === 0) {
				return false;
			}

			if (direction === 'prev') {
				// ArrowUp: go to older command
				if (historyIndex === null) {
					const first = serverHistories[0];
					if (first !== undefined) {
						draftRef.current = content;
						setHistoryIndex(0);
						setContent(first);
						moveCursorToEnd();
						return true;
					}
					return false;
				} else if (historyIndex < serverHistories.length - 1) {
					const nextIndex = historyIndex + 1;
					const item = serverHistories[nextIndex];
					if (item !== undefined) {
						setHistoryIndex(nextIndex);
						setContent(item);
						moveCursorToEnd();
						return true;
					}
				}
				// Already at oldest history entry
				return true;
			} else {
				// ArrowDown: go to newer command or restore draft
				if (historyIndex === null) {
					return false;
				}

				if (historyIndex > 0) {
					const nextIndex = historyIndex - 1;
					const item = serverHistories[nextIndex];
					if (item !== undefined) {
						setHistoryIndex(nextIndex);
						setContent(item);
						moveCursorToEnd();
						return true;
					}
				} else if (historyIndex === 0) {
					setHistoryIndex(null);
					setContent(draftRef.current);
					moveCursorToEnd();
					return true;
				}
			}

			return false;
		},
		[content, historyIndex, moveCursorToEnd, serverHistories, setContent],
	);

	const addHistory = useCallback(
		(command: string) => {
			const trimmed = command.trim();
			if (!trimmed) {
				return;
			}

			try {
				const existing = histories[historyKey] ?? [];
				// Deduplicate consecutive identical commands
				if (existing.length > 0 && existing[0] === trimmed) {
					setHistoryIndex(null);
					draftRef.current = '';
					return;
				}

				const updated = [trimmed, ...existing.filter((item) => item !== trimmed)].slice(0, MAX_HISTORY_PERSIST);
				setHistories({
					...histories,
					[historyKey]: updated,
				});
			} catch (e) {
				console.error('Failed to update terminal history:', e);
			}

			setHistoryIndex(null);
			draftRef.current = '';
		},
		[histories, historyKey, setHistories],
	);

	const selectHistoryItem = useCallback(
		(item: string) => {
			setContent(item);
			setOpenHistory(false);
			setHistoryIndex(null);
			draftRef.current = '';
			moveCursorToEnd();
			inputRef.current?.focus();
		},
		[inputRef, moveCursorToEnd, setContent],
	);

	const resetHistoryNavigation = useCallback(() => {
		setHistoryIndex(null);
		draftRef.current = '';
	}, []);

	return {
		serverHistories,
		openHistory,
		setOpenHistory,
		historyHighlightIndex,
		setHistoryHighlightIndex,
		navigateHistory,
		addHistory,
		selectHistoryItem,
		resetHistoryNavigation,
		isNavigatingHistory: historyIndex !== null,
	};
}
