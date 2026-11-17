// Java-parity corpus for stripColors.
// Pinned reference (do not track master; bump deliberately):
// - arc-core/src/arc/util/Strings.java @ 8eb00ffff0126d0576c67df46f99b8f6bccd96fe (2026-09-18)
// - arc-core/src/arc/graphics/Colors.java from the same tree
// Rules ported: single-pass scan, named lookup against UPPER + lowercase-noscore
// keys, 1-8 hex digits, `[]` pop stripped, `[[` escape semantics, unknown/unclosed
// kept literal, no trimming.
import { describe, expect, it } from 'vitest';

import { COLORS } from '../constants/index.js';
import { stripColors } from './index.js';

describe('stripColors named color parity', () => {
	it.each([
		['[red]hello', 'hello'],
		['[RED]hello', 'hello'],
		['[LIGHT_GRAY]hi', 'hi'],
		['[lightgray]hi', 'hi'],
		['[LIGHT_GREY]hi', 'hi'],
		['[lightgrey]hi', 'hi'],
		['[DARK_GRAY]hi', 'hi'],
		['[darkgray]hi', 'hi'],
		['[grey]hi', 'hi'],
		['[GREY]hi', 'hi'],
		['[clear]hi', 'hi'],
		['[CLEAR]hi', 'hi'],
		['[blue]hi', 'hi'],
		['[BLUE]hi', 'hi'],
		['[accent]hi', 'hi'],
		['[ACCENT]hi', 'hi'],
		['[stat]hi', 'hi'],
		['[STAT]hi', 'hi'],
		['[highlight]hi', 'hi'],
		['[HIGHLIGHT]hi', 'hi'],
		['[unlaunched]hi', 'hi'],
		['[UNLAUNCHED]hi', 'hi'],
		['[negstat]hi', 'hi'],
		['[NEGSTAT]hi', 'hi'],
	])('strips known name %s', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});

	it.each([
		['[ReD]hi', '[ReD]hi'],
		['[darkGray]hi', '[darkGray]hi'],
		['[light_gray]hi', '[light_gray]hi'],
		['[acCent]hi', '[acCent]hi'],
		['[e]hi', '[e]hi'],
		['[w]hi', '[w]hi'],
		['[VI]hello', '[VI]hello'],
		['[EN]hello', '[EN]hello'],
		['[unknown]hi', '[unknown]hi'],
		['[ red]hi', '[ red]hi'],
	])('keeps unknown or wrongly-cased name %s literal', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});
});

describe('stripColors hex parity', () => {
	it.each([
		['[#f]hi', 'hi'],
		['[#ff]hi', 'hi'],
		['[#ff0000]hello', 'hello'],
		['[#FF0000]hi', 'hi'],
		['[#fffffff]hi', 'hi'],
		['[#ffffffff]hello', 'hello'],
	])('strips 1-8 hex digit tag %s', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});

	it.each([
		['[#fffffffff]hello', '[#fffffffff]hello'],
		['[#]hi', '[#]hi'],
		['[#zzz]hello', '[#zzz]hello'],
		['[#ff00zz]hi', '[#ff00zz]hi'],
	])('keeps invalid hex tag %s literal', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});
});

describe('stripColors escapes and pop tags', () => {
	it.each([
		['[red]hello[]world', 'helloworld'],
		['[]hello', 'hello'],
		['hello [] world', 'hello  world'],
		['[[red]', '['],
		['[[', '[['],
		['a[[b', 'a[[b'],
		['[red', '[red'],
		['[', '['],
		['', ''],
		['[red][blue]hi', 'hi'],
		['[#ff0000][red]hi', 'hi'],
		['[red]a[blue]b', 'ab'],
	])('handles escape case %s', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});
});

describe('stripColors whitespace', () => {
	it.each([
		['  [red]hi  ', '  hi  '],
		['hello world', 'hello world'],
		['  hello  ', '  hello  '],
	])('preserves spacing for %s', (input, expected) => {
		expect(stripColors(input)).toBe(expected);
	});
});

describe('COLORS map alignment', () => {
	it('exposes Arc UPPER and lowercase-noscore keys', () => {
		for (const key of [
			'RED',
			'red',
			'LIGHT_GRAY',
			'lightgray',
			'DARK_GRAY',
			'darkgray',
			'CLEAR',
			'clear',
			'ACCENT',
			'accent',
			'STAT',
			'stat',
			'HIGHLIGHT',
			'highlight',
			'UNLAUNCHED',
			'unlaunched',
			'NEGSTAT',
			'negstat',
		]) {
			expect(COLORS[key]).toBeDefined();
		}
	});

	it('does not expose unregistered or miscased keys', () => {
		for (const key of ['e', 'w', '', 'darkGray', 'ReD', 'acCent']) {
			expect(COLORS[key]).toBeUndefined();
		}
	});
});
