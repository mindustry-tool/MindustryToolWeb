'use client';

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@mindustry-tool/api';
import { apiInstance } from '@/config/api';
import { levenshtein } from '@/lib/utils';
import type { AutosizeTextAreaRef } from '@/components/ui/autoresize-textarea';
import { tokenizeCommand, type ParsedCommand } from './tokenize-command';
import { useServer } from '@/app/[locale]/(with-navbar)/(everyone)/servers/hooks/use-server';

export interface AutocompleteSuggestion {
	id: string;
	title: string;
	subtitle?: string;
	description?: string;
	valueToInsert: string;
	category: 'command' | 'player' | 'map' | 'enum' | 'param';
	badge?: string;
}

const GAMEMODES = [
	{ name: 'survival', description: 'Defend against waves of enemies' },
	{ name: 'attack', description: 'Destroy enemy bases' },
	{ name: 'pvp', description: 'Battle against other player teams' },
	{ name: 'sandbox', description: 'Infinite resources and instant build' },
	{ name: 'editor', description: 'Custom map editing session' },
];

const BOOLEANS = [
	{ name: 'on', description: 'Enable setting' },
	{ name: 'off', description: 'Disable setting' },
	{ name: 'true', description: 'Set boolean value to true' },
	{ name: 'false', description: 'Set boolean value to false' },
];

const TEAMS = [
	{ name: 'sharded', description: 'Default player team (orange)' },
	{ name: 'crux', description: 'Primary enemy faction (red)' },
	{ name: 'derelict', description: 'Abandoned structures and units (gray)' },
	{ name: 'malis', description: 'Erekir enemy faction (purple)' },
	{ name: 'green', description: 'Green team' },
	{ name: 'blue', description: 'Blue team' },
];

export interface UseTerminalAutocompleteProps {
	serverId: string;
	content: string;
	setContent: (value: string) => void;
	cursor: number;
	setCursor: (value: number) => void;
	inputRef: RefObject<AutosizeTextAreaRef | null>;
}

export function useTerminalAutocomplete({
	serverId,
	content,
	setContent,
	cursor,
	setCursor,
	inputRef,
}: UseTerminalAutocompleteProps) {
	const [isOpenManualOverride, setIsOpenManualOverride] = useState<boolean | null>(null);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const { isOnline } = useServer(serverId);

	const prevContentRef = useRef(content);
	useEffect(() => {
		if (prevContentRef.current !== content) {
			prevContentRef.current = content;
			setIsOpenManualOverride(null);
		}
	}, [content]);

	// Fetch server commands
	const commandsQueryKey = useMemo(() => ['servers', serverId, 'commands'], [serverId]);

	const { data: commands = [] } = useQuery({
		enabled: isOnline,
		queryKey: commandsQueryKey,
		queryFn: () =>
			apiInstance.request(api.v4.servers.commands.getAll, {
				params: { id: serverId },
			}),
	});

	// Fetch server players for player auto-completion
	const playersQueryKey = useMemo(() => ['servers', serverId, 'players'], [serverId]);
	const { data: players = [] } = useQuery({
		queryKey: playersQueryKey,
		queryFn: () =>
			apiInstance.request(api.v4.servers.players.getAll, {
				params: { id: serverId },
			}),
	});

	// Fetch server maps for map auto-completion
	const mapsQueryKey = useMemo(() => ['servers', serverId, 'maps'], [serverId]);
	const { data: maps = [] } = useQuery({
		queryKey: mapsQueryKey,
		queryFn: () =>
			apiInstance.request(api.v4.servers.maps.getAll, {
				params: { id: serverId },
			}),
	});

	// Parse command structure using CommandHandler rules
	const parsed: ParsedCommand = useMemo(() => {
		return tokenizeCommand(content, cursor, commands);
	}, [content, cursor, commands]);

	// Build suggestions based on parsed active target
	const suggestions: AutocompleteSuggestion[] = useMemo(() => {
		if (!parsed.isSlashCommand) {
			return [];
		}

		if (parsed.activeTarget === 'command') {
			const query = parsed.activeToken.toLowerCase().trim();
			let matched = commands;

			if (query.length > 0) {
				matched = commands
					.filter((cmd) => cmd.text.toLowerCase().includes(query))
					.sort((a, b) => {
						const aStarts = a.text.toLowerCase().startsWith(query);
						const bStarts = b.text.toLowerCase().startsWith(query);
						if (aStarts && !bStarts) return -1;
						if (!aStarts && bStarts) return 1;
						return levenshtein(a.text, query) - levenshtein(b.text, query);
					});
			} else {
				// When user only types "/", display ALL commands sorted alphabetically so they can discover everything
				matched = [...commands].sort((a, b) => a.text.localeCompare(b.text));
			}

			return matched.map((cmd) => ({
				id: `cmd-${cmd.text}`,
				title: `/${cmd.text}`,
				subtitle: cmd.paramText,
				description: cmd.description,
				valueToInsert: `/${cmd.text} `,
				category: 'command' as const,
				badge: cmd.params.length > 0 ? `${cmd.params.length} args` : undefined,
			}));
		}

		if (parsed.activeTarget === 'argument' && parsed.commandDef) {
			const activeParam = parsed.activeParam;
			if (!activeParam) {
				return [];
			}

			const paramName = activeParam.name.toLowerCase();
			const query = parsed.activeToken.toLowerCase();

			// 1. Player suggestions
			if (paramName.includes('player') || paramName.includes('user') || paramName.includes('target')) {
				const matchedPlayers = players
					.filter((p) => p.name.toLowerCase().includes(query) || p.uuid.toLowerCase().includes(query))
					.map((p) => ({
						id: `player-${p.uuid}`,
						title: p.name,
						subtitle: p.team?.name ? `Team: ${p.team.name}` : undefined,
						description: `UUID: ${p.uuid}`,
						valueToInsert: p.name.includes(' ') && !activeParam.variadic ? `"${p.name}"` : p.name,
						category: 'player' as const,
						badge: p.isAdmin ? 'Admin' : undefined,
					}));

				if (matchedPlayers.length > 0) {
					return matchedPlayers.slice(0, 10);
				}
			}

			// 2. Map suggestions
			if (paramName.includes('map')) {
				const matchedMaps = maps
					.filter((m) => m.name.toLowerCase().includes(query) || m.filename.toLowerCase().includes(query))
					.map((m) => ({
						id: `map-${m.filename}`,
						title: m.name,
						subtitle: `${m.width}x${m.height}`,
						description: m.filename,
						valueToInsert: m.name.includes(' ') && !activeParam.variadic ? `"${m.name}"` : m.name,
						category: 'map' as const,
						badge: m.custom ? 'Custom' : 'Default',
					}));

				if (matchedMaps.length > 0) {
					return matchedMaps.slice(0, 10);
				}
			}

			// 3. Command suggestions (e.g. for /help [command])
			if (paramName.includes('command')) {
				return commands
					.filter((cmd) => cmd.text.toLowerCase().includes(query))
					.slice(0, 10)
					.map((cmd) => ({
						id: `param-cmd-${cmd.text}`,
						title: cmd.text,
						subtitle: cmd.paramText,
						description: cmd.description,
						valueToInsert: cmd.text,
						category: 'command' as const,
					}));
			}

			// 4. Gamemode suggestions
			if (paramName.includes('mode') || paramName.includes('gamemode')) {
				return GAMEMODES.filter((g) => g.name.toLowerCase().includes(query)).map((g) => ({
					id: `mode-${g.name}`,
					title: g.name,
					description: g.description,
					valueToInsert: g.name,
					category: 'enum' as const,
				}));
			}

			// 5. Boolean suggestions
			if (
				paramName.includes('bool') ||
				paramName.includes('state') ||
				paramName.includes('on/off') ||
				paramName.includes('enabled')
			) {
				return BOOLEANS.filter((b) => b.name.toLowerCase().includes(query)).map((b) => ({
					id: `bool-${b.name}`,
					title: b.name,
					description: b.description,
					valueToInsert: b.name,
					category: 'enum' as const,
				}));
			}

			// 6. Team suggestions
			if (paramName.includes('team')) {
				return TEAMS.filter((t) => t.name.toLowerCase().includes(query)).map((t) => ({
					id: `team-${t.name}`,
					title: t.name,
					description: t.description,
					valueToInsert: t.name,
					category: 'enum' as const,
				}));
			}

			// Fallback: parameter specification hint card
			return [
				{
					id: `param-hint-${activeParam.name}`,
					title: `${activeParam.optional ? '[' : '<'}${activeParam.name}${activeParam.variadic ? '...' : ''}${activeParam.optional ? ']' : '>'}`,
					subtitle: activeParam.optional ? 'Optional' : 'Mandatory',
					description: activeParam.variadic
						? 'Variadic: captures all remaining text to the end of the line'
						: 'Positional argument',
					valueToInsert: '',
					category: 'param' as const,
				},
			];
		}

		return [];
	}, [commands, maps, parsed, players]);

	// Effective open state
	const isOpen = useMemo(() => {
		if (isOpenManualOverride === false) return false;
		if (!parsed.isSlashCommand) return false;
		return suggestions.length > 0;
	}, [isOpenManualOverride, parsed.isSlashCommand, suggestions.length]);

	const dismiss = useCallback(() => {
		setIsOpenManualOverride(false);
		setHighlightedIndex(0);
	}, []);

	const cycleHighlight = useCallback(
		(direction: 'next' | 'prev') => {
			if (suggestions.length === 0) return;
			setHighlightedIndex((prev) => {
				if (direction === 'next') {
					return (prev + 1) % suggestions.length;
				} else {
					return (prev - 1 + suggestions.length) % suggestions.length;
				}
			});
		},
		[suggestions.length],
	);

	const applySuggestion = useCallback(
		(suggestion: AutocompleteSuggestion) => {
			if (!suggestion.valueToInsert) {
				dismiss();
				return;
			}

			let newContent = '';
			let newCursor = 0;

			if (parsed.activeTarget === 'command') {
				newContent = suggestion.valueToInsert;
				newCursor = newContent.length;
			} else {
				const [start, end] = parsed.activeTokenRange;
				const insertVal = suggestion.valueToInsert.endsWith(' ')
					? suggestion.valueToInsert
					: `${suggestion.valueToInsert} `;

				newContent = content.slice(0, start) + insertVal + content.slice(end);
				newCursor = start + insertVal.length;
			}

			setContent(newContent);
			setCursor(newCursor);
			setIsOpenManualOverride(null);
			setHighlightedIndex(0);

			setTimeout(() => {
				const textarea = inputRef.current?.textArea;
				if (textarea) {
					textarea.focus();
					textarea.setSelectionRange(newCursor, newCursor);
				}
			}, 0);
		},
		[content, dismiss, inputRef, parsed.activeTarget, parsed.activeTokenRange, setContent, setCursor],
	);

	const selectHighlighted = useCallback((): boolean => {
		if (!isOpen || suggestions.length === 0) {
			return false;
		}

		const selected = suggestions[highlightedIndex] ?? suggestions[0];
		if (selected) {
			applySuggestion(selected);
			return true;
		}
		return false;
	}, [applySuggestion, highlightedIndex, isOpen, suggestions]);

	// Auto-reset highlight index when suggestion count changes
	if (highlightedIndex >= suggestions.length && suggestions.length > 0) {
		setHighlightedIndex(0);
	}

	return {
		parsed,
		suggestions,
		isOpen,
		highlightedIndex,
		setHighlightedIndex,
		dismiss,
		cycleHighlight,
		applySuggestion,
		selectHighlighted,
	};
}
