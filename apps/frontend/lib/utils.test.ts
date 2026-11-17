import { COLORS } from '@mindustry-tool/api';
import { describe, expect, it } from 'vitest';

import { isWebGLError, parseColorText } from './utils';

describe('parseColorText', () => {
	describe('named color tokens', () => {
		it('strips a valid named color token and colors the following text', () => {
			const result = parseColorText('[red]hello');

			expect(result).toEqual([{ text: 'hello', color: '#ff0000', format: { color: '#ff0000' }, line: 'hello' }]);
		});

		it('resolves named colors from the COLORS map', () => {
			const result = parseColorText('[red]hello');

			expect(result[0]?.format).toEqual({ color: COLORS.red });
		});

		it('treats fully-upper and lowercase tokens identically (Arc parity)', () => {
			const lower = parseColorText('[red]hello');
			const upper = parseColorText('[RED]hello');

			expect(upper).toEqual(lower);
		});

		it('keeps mixed-case tokens as literal text (Arc parity)', () => {
			expect(parseColorText('[ReD]hello')).toEqual([{ line: '[ReD]hello', format: {} }]);
		});

		it('does not strip an unknown bracket token and keeps it as literal text', () => {
			const result = parseColorText('[VI]hello');

			expect(result).toEqual([{ line: '[VI]hello', format: {} }]);
		});

		it('parses Mindustry UI colors (accent, stat, highlight, unlaunched, negstat)', () => {
			expect(parseColorText('[accent]82')).toEqual([
				{ text: '82', color: '#ffd37f', format: { color: '#ffd37f' }, line: '82' },
			]);
			expect(parseColorText('[ACCENT]82')).toEqual([
				{ text: '82', color: '#ffd37f', format: { color: '#ffd37f' }, line: '82' },
			]);
			expect(parseColorText('[stat]text')).toEqual([
				{ text: 'text', color: '#ffd37f', format: { color: '#ffd37f' }, line: 'text' },
			]);
			expect(parseColorText('[highlight]text')).toEqual([
				{ text: 'text', color: '#ffe0a5', format: { color: '#ffe0a5' }, line: 'text' },
			]);
			expect(parseColorText('[unlaunched]text')).toEqual([
				{ text: 'text', color: '#8982ed', format: { color: '#8982ed' }, line: 'text' },
			]);
			expect(parseColorText('[negstat]text')).toEqual([
				{ text: 'text', color: '#e55454', format: { color: '#e55454' }, line: 'text' },
			]);
		});

		it('correctly handles strings with literal tags preceding accent tag like user input', () => {
			const result = parseColorText('[TR] <[accent]82> BEŞİKTAŞ');
			expect(result).toEqual([
				{ text: '[TR] <', line: '[TR] <', color: 'var(--foreground)', format: {} },
				{ text: '82> BEŞİKTAŞ', line: '82> BEŞİKTAŞ', color: '#ffd37f', format: { color: '#ffd37f' } },
			]);
		});
	});

	describe('hex color tokens', () => {
		it('strips a valid hex color token and colors the following text', () => {
			const result = parseColorText('[#ff0000]hello');

			expect(result).toEqual([{ text: 'hello', color: '#ff0000', format: { color: '#ff0000' }, line: 'hello' }]);
		});

		it('pads a short hex token to a full hex value', () => {
			const result = parseColorText('[#f00]hello');

			expect(result[0]?.format).toEqual({ color: '#f00000' });
		});

		it('does not strip a hex-like token with non-hex characters', () => {
			const result = parseColorText('[#zzz]hello');

			expect(result).toEqual([{ line: '[#zzz]hello', format: {} }]);
		});

		it('strips 7-8 digit hex tokens per Arc parity', () => {
			const result = parseColorText('[#ffffffff]hello');

			expect(result).toEqual([{ text: 'hello', color: '#ffffffff', format: { color: '#ffffffff' }, line: 'hello' }]);
		});

		it('keeps 9+ digit hex tokens as literal text per Arc parity', () => {
			expect(parseColorText('[#fffffffff]hello')).toEqual([{ line: '[#fffffffff]hello', format: {} }]);
		});
	});

	describe('unknown bracket tokens', () => {
		it('preserves [VI] as literal text', () => {
			expect(parseColorText('[VI]hello')).toEqual([{ line: '[VI]hello', format: {} }]);
		});

		it('preserves [EN] as literal text', () => {
			expect(parseColorText('[EN]hello')).toEqual([{ line: '[EN]hello', format: {} }]);
		});
	});

	describe('reset token', () => {
		it('removes the reset token and color markers from the visible text', () => {
			const result = parseColorText('[red]hello[]world');

			expect(result.map((segment) => segment.line)).toEqual(['hello', 'world']);
			expect(result[0]?.format).toEqual({ color: '#ff0000' });
		});
	});

	describe('ANSI escape codes', () => {
		it('strips the escape sequence and applies the ANSI format', () => {
			const result = parseColorText('\u001B[31mhello');

			expect(result.map((segment) => segment.line)).toEqual(['hello']);
			expect(result[0]?.format).toEqual({ color: 'red' });
		});
	});

	describe('plain text', () => {
		it('returns text unchanged with an empty format when no color tokens exist', () => {
			expect(parseColorText('hello world')).toEqual([{ line: 'hello world', format: {} }]);
		});
	});

	describe('empty input', () => {
		it('returns an empty array for undefined', () => {
			expect(parseColorText(undefined)).toEqual([]);
		});

		it('returns an empty array for an empty string', () => {
			expect(parseColorText('')).toEqual([]);
		});
	});

	describe('newlines', () => {
		it('splits multiline text into separate line segments', () => {
			const result = parseColorText('line one\nline two');

			expect(result.map((segment) => segment.line)).toEqual(['line one', '\n', 'line two']);
		});
	});
});

describe('isWebGLError', () => {
	it('detects standard WebGL context creation error', () => {
		expect(isWebGLError(new Error('Error creating WebGL context.'))).toBe(true);
	});

	it('detects THREE.WebGLRenderer error', () => {
		expect(isWebGLError(new Error('THREE.WebGLRenderer: Error creating WebGL context.'))).toBe(true);
	});

	it('returns false for unrelated errors', () => {
		expect(isWebGLError(new Error('Network request failed'))).toBe(false);
	});

	it('handles non-Error objects and strings', () => {
		expect(isWebGLError('Error creating WebGL context.')).toBe(true);
		expect(isWebGLError({ message: 'Error creating WebGL context.' })).toBe(true);
		expect(isWebGLError('Generic string error')).toBe(false);
		expect(isWebGLError(null)).toBe(false);
		expect(isWebGLError(undefined)).toBe(false);
	});
});

