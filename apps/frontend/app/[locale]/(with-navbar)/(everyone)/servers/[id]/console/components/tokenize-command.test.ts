import { describe, expect, it } from 'vitest';
import type { ServerCommandDto } from '@mindustry-tool/api';
import { tokenizeCommand } from './tokenize-command';

const mockCommands: ServerCommandDto[] = [
	{
		text: 'help',
		paramText: '[command]',
		description: 'Display this list of commands.',
		params: [{ name: 'command', optional: true, variadic: false }],
	},
	{
		text: 'kick',
		paramText: '<player...>',
		description: 'Kick a player by name or ID.',
		params: [{ name: 'player', optional: false, variadic: true }],
	},
	{
		text: 'host',
		paramText: '[map] [mode]',
		description: 'Host a game with map and mode.',
		params: [
			{ name: 'map', optional: true, variadic: false },
			{ name: 'mode', optional: true, variadic: false },
		],
	},
	{
		text: 'ban',
		paramText: '<type> <target> <reason...>',
		description: 'Ban a player by type and target with a required reason',
		params: [
			{ name: 'type', optional: false, variadic: false },
			{ name: 'target', optional: false, variadic: false },
			{ name: 'reason', optional: false, variadic: true },
		],
	},
	{
		text: 'stop',
		paramText: '',
		description: 'Stop the server.',
		params: [],
	},
];

describe('tokenizeCommand with arc.util.CommandHandler rules', () => {
	it('handles non-slash text as chat', () => {
		const parsed = tokenizeCommand('hello world', 5, mockCommands);
		expect(parsed.isSlashCommand).toBe(false);
		expect(parsed.activeTarget).toBe('none');
		expect(parsed.validationStatus).toBe('valid');
	});

	it('identifies command name matching', () => {
		const parsed = tokenizeCommand('/ki', 3, mockCommands);
		expect(parsed.isSlashCommand).toBe(true);
		expect(parsed.activeTarget).toBe('command');
		expect(parsed.commandName).toBe('ki');
		expect(parsed.activeToken).toBe('ki');
	});

	it('identifies variadic parameter and consumes remainder', () => {
		// /kick John Doe
		const input = '/kick John Doe';
		const parsed = tokenizeCommand(input, input.length, mockCommands);

		expect(parsed.isSlashCommand).toBe(true);
		expect(parsed.commandName).toBe('kick');
		expect(parsed.activeTarget).toBe('argument');
		expect(parsed.activeParamIndex).toBe(0);
		expect(parsed.activeParam?.name).toBe('player');
		expect(parsed.activeParam?.variadic).toBe(true);
		expect(parsed.validationStatus).toBe('valid');
	});

	it('validates fewArguments when mandatory parameter is missing', () => {
		const parsed = tokenizeCommand('/ban ', 5, mockCommands);
		expect(parsed.commandName).toBe('ban');
		expect(parsed.validationStatus).toBe('fewArguments');
		expect(parsed.missingParam?.name).toBe('type');
	});

	it('validates manyArguments when excess arguments are provided to non-variadic command', () => {
		// /host takes [map] [mode] (2 args max)
		const parsed = tokenizeCommand('/host map1 mode1 extraArg', 24, mockCommands);
		expect(parsed.commandName).toBe('host');
		expect(parsed.validationStatus).toBe('manyArguments');
	});

	it('handles cursor in the middle of arguments', () => {
		const input = '/ban id player1 reason with spaces';
		// Cursor placed inside 'player1' (index 11)
		const parsed = tokenizeCommand(input, 11, mockCommands);
		expect(parsed.activeParamIndex).toBe(1);
		expect(parsed.activeParam?.name).toBe('target');
		expect(parsed.activeToken).toBe('player1');
	});

	it('handles cursor in variadic argument word', () => {
		const input = '/ban id player1 reason with spaces';
		// Cursor placed on 'with' (index 25)
		const parsed = tokenizeCommand(input, 25, mockCommands);
		expect(parsed.activeParamIndex).toBe(2);
		expect(parsed.activeParam?.name).toBe('reason');
		expect(parsed.activeParam?.variadic).toBe(true);
		expect(parsed.activeToken).toBe('with');
	});
});
