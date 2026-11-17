import type { ServerCommandDto, ServerCommandParamDto } from '@mindustry-tool/api';

export type CommandValidationStatus = 'valid' | 'fewArguments' | 'manyArguments' | 'unknownCommand' | 'empty';

export interface CommandArgumentToken {
	index: number;
	value: string;
	range: [number, number];
	param?: ServerCommandParamDto;
	isVariadic: boolean;
}

export interface ParsedCommand {
	rawInput: string;
	cursor: number;
	isSlashCommand: boolean;
	commandName: string;
	commandRange: [number, number];
	commandDef?: ServerCommandDto;
	activeTarget: 'command' | 'argument' | 'none';
	activeParamIndex: number;
	activeParam?: ServerCommandParamDto;
	activeToken: string;
	activeTokenRange: [number, number];
	args: CommandArgumentToken[];
	validationStatus: CommandValidationStatus;
	missingParam?: ServerCommandParamDto;
}

/**
 * Tokenizes and parses terminal input adhering strictly to Mindustry's arc.util.CommandHandler
 */
export function tokenizeCommand(
	rawInput: string,
	cursor: number,
	commandDefs: ServerCommandDto[] = [],
): ParsedCommand {
	const isSlashCommand = rawInput.startsWith('/');
	const textWithoutSlash = isSlashCommand ? rawInput.slice(1) : rawInput;
	const prefixOffset = isSlashCommand ? 1 : 0;

	if (!isSlashCommand) {
		return {
			rawInput,
			cursor,
			isSlashCommand: false,
			commandName: '',
			commandRange: [0, 0],
			activeTarget: 'none',
			activeParamIndex: -1,
			activeToken: rawInput,
			activeTokenRange: [0, rawInput.length],
			args: [],
			validationStatus: 'valid',
		};
	}

	const firstSpaceIndex = rawInput.indexOf(' ');

	// Case 1: Cursor or input is in command name (before first space)
	if (firstSpaceIndex === -1 || cursor <= firstSpaceIndex) {
		const commandName = firstSpaceIndex === -1 ? textWithoutSlash : rawInput.slice(prefixOffset, firstSpaceIndex);
		const commandRange: [number, number] = [prefixOffset, firstSpaceIndex === -1 ? rawInput.length : firstSpaceIndex];
		const commandDef = commandDefs.find((c) => c.text.toLowerCase() === commandName.toLowerCase());

		let validationStatus: CommandValidationStatus = 'empty';
		if (commandName.trim().length > 0) {
			if (!commandDef) {
				validationStatus = 'unknownCommand';
			} else {
				const hasRequired = commandDef.params.some((p) => !p.optional);
				validationStatus = hasRequired ? 'fewArguments' : 'valid';
			}
		}

		return {
			rawInput,
			cursor,
			isSlashCommand: true,
			commandName,
			commandRange,
			commandDef,
			activeTarget: 'command',
			activeParamIndex: -1,
			activeToken: commandName,
			activeTokenRange: commandRange,
			args: [],
			validationStatus,
			missingParam: commandDef?.params.find((p) => !p.optional),
		};
	}

	// Case 2: Cursor is in argument section (after first space)
	const commandName = rawInput.slice(prefixOffset, firstSpaceIndex);
	const commandRange: [number, number] = [prefixOffset, firstSpaceIndex];
	const commandDef = commandDefs.find((c) => c.text.toLowerCase() === commandName.toLowerCase());

	const args: CommandArgumentToken[] = [];
	const afterCommandOffset = firstSpaceIndex + 1;
	let currentOffset = afterCommandOffset;
	const params = commandDef?.params ?? [];

	let paramIndex = 0;
	while (currentOffset <= rawInput.length) {
		const currentParam = params[paramIndex];
		const isVariadic = currentParam?.variadic ?? false;

		if (isVariadic) {
			// Variadic param captures all remaining text without space splitting
			const value = rawInput.slice(currentOffset);
			args.push({
				index: paramIndex,
				value,
				range: [currentOffset, rawInput.length],
				param: currentParam,
				isVariadic: true,
			});
			break;
		}

		const nextSpace = rawInput.indexOf(' ', currentOffset);
		if (nextSpace === -1) {
			const value = rawInput.slice(currentOffset);
			args.push({
				index: paramIndex,
				value,
				range: [currentOffset, rawInput.length],
				param: currentParam,
				isVariadic: false,
			});
			break;
		} else {
			const value = rawInput.slice(currentOffset, nextSpace);
			args.push({
				index: paramIndex,
				value,
				range: [currentOffset, nextSpace],
				param: currentParam,
				isVariadic: false,
			});
			currentOffset = nextSpace + 1;
			paramIndex++;
		}
	}

	// Identify active token & active param at cursor
	const activeTarget: 'command' | 'argument' = 'argument';
	let activeParamIndex = 0;
	let activeToken = '';
	let activeTokenRange: [number, number] = [rawInput.length, rawInput.length];
	let activeParam: ServerCommandParamDto | undefined;

	// Check which argument token contains the cursor
	const matchedArg = args.find((arg) => cursor >= arg.range[0] && cursor <= arg.range[1]);

	if (matchedArg) {
		activeParamIndex = matchedArg.index;
		activeParam = matchedArg.param;

		if (matchedArg.isVariadic) {
			// Inside a variadic parameter: the active token for completion is the specific word at cursor
			const textBeforeCursor = rawInput.slice(matchedArg.range[0], cursor);
			const lastSpaceInVariadic = textBeforeCursor.lastIndexOf(' ');
			const wordStart = lastSpaceInVariadic === -1 ? matchedArg.range[0] : matchedArg.range[0] + lastSpaceInVariadic + 1;

			const textAfterCursor = rawInput.slice(cursor, matchedArg.range[1]);
			const nextSpaceInVariadic = textAfterCursor.indexOf(' ');
			const wordEnd = nextSpaceInVariadic === -1 ? matchedArg.range[1] : cursor + nextSpaceInVariadic;

			activeToken = rawInput.slice(wordStart, wordEnd);
			activeTokenRange = [wordStart, wordEnd];
		} else {
			activeToken = matchedArg.value;
			activeTokenRange = matchedArg.range;
		}
	} else if (args.length > 0) {
		// Cursor is at or past the end
		const lastArg = args[args.length - 1];
		if (lastArg) {
			activeParamIndex = lastArg.index;
			activeParam = lastArg.param;
		}
		activeToken = '';
		activeTokenRange = [cursor, cursor];
	} else {
		activeParamIndex = 0;
		activeParam = params[0];
		activeToken = '';
		activeTokenRange = [afterCommandOffset, afterCommandOffset];
	}

	// Determine CommandHandler validation status
	let validationStatus: CommandValidationStatus = 'valid';
	let missingParam: ServerCommandParamDto | undefined;

	if (!commandDef) {
		validationStatus = 'unknownCommand';
	} else {
		const requiredParams = params.filter((p) => !p.optional);
		const providedCount = args.filter((a) => a.value.trim().length > 0).length;

		if (providedCount < requiredParams.length) {
			validationStatus = 'fewArguments';
			missingParam = requiredParams[providedCount];
		} else if (params.length > 0 && !params[params.length - 1]?.variadic && args.length > params.length) {
			validationStatus = 'manyArguments';
		} else {
			validationStatus = 'valid';
		}
	}

	return {
		rawInput,
		cursor,
		isSlashCommand: true,
		commandName,
		commandRange,
		commandDef,
		activeTarget,
		activeParamIndex,
		activeParam,
		activeToken,
		activeTokenRange,
		args,
		validationStatus,
		missingParam,
	};
}
