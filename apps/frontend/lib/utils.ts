import type { FileDto, Session } from '@mindustry-tool/api';
import type { ClassValue } from 'clsx';
import { ApiError } from '@mindustry-tool/api';
import { COLORS } from '@mindustry-tool/api';
import { fileDto } from '@mindustry-tool/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod/v4-mini';
import { type QueryParam, mergeQueryParams } from '@/lib/query-params';
export { type QueryParam, mergeQueryParams };

const COLOR_REGEX = /(\[#*[a-f0-9]*\]|\[#*[a-z]*\]|\u001B\[[0-9;]*m)/gi;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isNotFoundError(error: unknown): error is ApiError {
	return !!error && error instanceof ApiError && error.response.status === 404;
}

export const is404Error = isNotFoundError;

export const TEXT_COLORS = [
	'text-red-500 data-[state=on]:text-red-500 hover:text-red-500',
	'text-orange-500 data-[state=on]:text-orange-500 hover:text-orange-500',
	'text-amber-500 data-[state=on]:text-amber-500 hover:text-amber-500',
	'text-yellow-500 data-[state=on]:text-yellow-500 hover:text-yellow-500',
	'text-lime-500 data-[state=on]:text-lime-500 hover:text-lime-500',
	'text-green-500 data-[state=on]:text-green-500 hover:text-green-500',
	'text-emerald-500 data-[state=on]:text-emerald-500 hover:text-emerald-500',
	'text-teal-500 data-[state=on]:text-teal-500 hover:text-teal-500',
	'text-cyan-500 data-[state=on]:text-cyan-500 hover:text-cyan-500',
	'text-sky-500 data-[state=on]:text-sky-500 hover:text-sky-500',
	'text-blue-500 data-[state=on]:text-blue-500 hover:text-blue-500',
	'text-indigo-500 data-[state=on]:text-indigo-500 hover:text-indigo-500',
	'text-violet-500 data-[state=on]:text-violet-500 hover:text-violet-500',
	'text-purple-500 data-[state=on]:text-purple-500 hover:text-purple-500',
	'text-fuchsia-500 data-[state=on]:text-fuchsia-500 hover:text-fuchsia-500',
	'text-pink-500 data-[state=on]:text-pink-500 hover:text-pink-500',
	'text-rose-500 data-[state=on]:text-rose-500 hover:text-rose-500',
];

export const BACKGROUND_COLORS = [
	'bg-red-950 data-[state=on]:bg-red-950 hover:bg-red-950',
	'bg-orange-950 data-[state=on]:bg-orange-950 hover:bg-orange-950',
	'bg-amber-950 data-[state=on]:bg-amber-950 hover:bg-amber-950',
	'bg-yellow-950 data-[state=on]:bg-yellow-950 hover:bg-yellow-950',
	'bg-lime-950 data-[state=on]:bg-lime-950 hover:bg-lime-950',
	'bg-green-950 data-[state=on]:bg-green-950 hover:bg-green-950',
	'bg-emerald-950 data-[state=on]:bg-emerald-950 hover:bg-emerald-950',
	'bg-teal-950 data-[state=on]:bg-teal-950 hover:bg-teal-950',
	'bg-cyan-950 data-[state=on]:bg-cyan-950 hover:bg-cyan-950',
	'bg-sky-950 data-[state=on]:bg-sky-950 hover:bg-sky-950',
	'bg-blue-950 data-[state=on]:bg-blue-950 hover:bg-blue-950',
	'bg-indigo-950 data-[state=on]:bg-indigo-950 hover:bg-indigo-950',
	'bg-violet-950 data-[state=on]:bg-violet-950 hover:bg-violet-950',
	'bg-purple-950 data-[state=on]:bg-purple-950 hover:bg-purple-950',
	'bg-fuchsia-950 data-[state=on]:bg-fuchsia-950 hover:bg-fuchsia-950',
	'bg-pink-950 data-[state=on]:bg-pink-950 hover:bg-pink-950',
	'bg-rose-950 data-[state=on]:bg-rose-950 hover:bg-rose-950',
];

export async function ping(url: string) {
	const started = new Date().getTime();
	await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
	const ended = new Date().getTime();
	const milliseconds = ended - started;
	return milliseconds;
}

export function getColor(text: string | undefined, colors: string[]) {
	if (text === undefined) {
		return colors[0];
	}

	const hash = text.split('').reduce((acc, cur, index) => acc + index * cur.charCodeAt(0) * 30, 0);
	return colors[hash % colors.length];
}

export async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
	const errors: unknown[] = [];
	let attempts = 0;
	while (attempts < retries) {
		try {
			return await fn();
		} catch (e) {
			attempts++;
			errors.push(e);
		}
	}

	console.warn(errors);

	throw new Error(`Max retries reached: ${attempts}/${retries}`, { cause: errors });
}

export function hasProperty(obj: unknown, key: string): obj is { [key: string]: unknown } {
	return typeof obj === 'object' && obj !== null && key in obj;
}

type ParseResult = {
	line: string;
	format: Format;
}[];

export function parseColorText(text: string | undefined): ParseResult {
	if (!text) {
		return [];
	}

	const arr = text.match(COLOR_REGEX);

	if (!arr) {
		return breakdownLine(text).map((line) => ({ line, format: {} }));
	}

	const colors: {
		rawColor: string;
		color: string;
		format: Format;
		index: number;
	}[] = [];

	let index = -1;

	for (let i = 0; i < arr.length; i++) {
		const value = arr[i];

		if (!value) {
			continue;
		}

		index = text.indexOf(value, index + 1);
		const rawColor = value;
		const { color, format } = resolveColorAndFormat(rawColor);

		if (color) {
			colors.push({
				rawColor,
				color,
				format,
				index,
			});
		}
	}

	if (colors.length === 0) {
		return [{ line: text, format: {} }];
	}

	const formatted: {
		text: string;
		color: string;
		format: Format;
	}[] = [];

	if (colors.length > 0) {
		const firstColor = colors.at(0);
		const firstText = text.substring(0, firstColor?.index || 0);
		if (firstText) {
			formatted.push({
				text: firstText,
				color: 'var(--foreground)',
				format: {},
			});
		}
	}

	for (let i = 0; i < colors.length - 1; i++) {
		const current = colors[i];
		const next = colors[i + 1];

		if (!current || !next) {
			throw new Error('Invalid color format');
		}

		const subtext = text.substring(current.index + current.rawColor.length, next.index);

		if (!subtext) {
			continue;
		}

		formatted.push({
			text: subtext,
			color: current.color,
			format: current.format,
		});
	}

	const last = colors[colors.length - 1];

	if (!last) {
		throw new Error('Invalid color format');
	}

	formatted.push({
		text: text.substring(last.index + last.rawColor.length),
		color: last.color,
		format: last.format,
	});

	const result = formatted.flatMap((f) => breakdownLine(f.text).map((line) => ({ ...f, line })));
	return result;
}

const ANSI: Record<string, Format> = {
	// ANSI color codes
	'0': {},
	'1': { fontWeight: 'bold' },
	'2': { opacity: 0.5 },
	'3': { fontStyle: 'italic' },
	'4': { textDecoration: 'line-through' },
	'9': { textDecorationLine: 'line-through' },
	'22': { fontWeight: 'bold' },
	'23': { opacity: 0.5 },
	'24': { fontStyle: 'italic' },
	'25': { textDecoration: 'line-through' },
	'29': { textDecorationLine: 'line-through' },
	'30': { color: 'black' },
	'31': { color: 'red' },
	'32': { color: 'green' },
	'33': { color: 'yellow' },
	'34': { color: 'blue' },
	'35': { color: 'magenta' },
	'36': { color: 'cyan' },
	'37': { color: 'white' },
	'40': { backgroundColor: 'black' },
	'41': { backgroundColor: 'red' },
	'42': { backgroundColor: 'green' },
	'43': { backgroundColor: 'yellow' },
	'44': { backgroundColor: 'blue' },
	'45': { backgroundColor: 'magenta' },
	'46': { backgroundColor: 'cyan' },
	'47': { backgroundColor: 'white' },
	'90': { color: '#555555' },
	'91': { color: '#FF5555' },
	'92': { color: '#55FF55' },
	'93': { color: '#FFFF55' },
	'94': { color: '#5555FF' },
	'95': { color: '#FF55FF' },
	'96': { color: '#55FFFF' },
	'97': { color: '#FFFFFF' },
};

type Format = {
	backgroundColor?: string;
	color?: string;
	fontWeight?: 'bold';
	fontStyle?: 'italic';
	textDecoration?: 'line-through';
	textDecorationLine?: 'line-through';
	opacity?: number; // light color
};

function resolveFormat(keys: string[]) {
	let format = {};

	for (const key of keys) {
		const v = ANSI[key];

		if (v && Object.keys(v).length !== 0) {
			format = {
				...format,
				...v,
			};
		} else {
			format = {};
		}
	}

	return format;
}

type ColorAndFormat = {
	color: string;
	format: Format;
};

function resolveColorAndFormat(color: string): ColorAndFormat {
	if (color.startsWith('[') && color.endsWith(']')) {
		const inner = color.substring(1, color.length - 1);

		// Reset to default foreground
		if (inner === '') {
			return {
				format: { color: 'var(--foreground)' },
				color: 'var(--foreground)',
			};
		}

		// Hex color code (Arc parity: 1-8 hex digits; short values padded for rendering)
		if (inner.startsWith('#')) {
			if (!/^#[0-9a-f]{1,8}$/i.test(inner)) {
				return { color: '', format: {} };
			}

			const resolved = inner.padEnd(7, '0');

			return {
				format: { color: resolved },
				color: resolved,
			};
		}

		// Named color (Arc parity: exact UPPER or lowercase-noscore key, no folding)
		const resolved = COLORS[inner];

		if (!resolved) {
			return { color: '', format: {} };
		}

		return {
			format: { color: resolved },
			color: resolved,
		};
	} else {
		color = color.substring(color.indexOf('['));

		const keys = color.replaceAll('m', ' ').replace('\u001B[', '').replace('[', '').split(' ').filter(Boolean);

		return {
			color,
			format: resolveFormat(keys),
		};
	}
}

function breakdownLine(text: string): string[] {
	if (text === '[]') {
		return [];
	}

	const lines = text.split(/\n/g);
	const result: string[] = [];

	if (lines.length === 1) {
		return [text];
	}

	const line = lines[0];
	if (line) result.push(line);

	for (let i = 1; i < lines.length; i++) {
		result.push('\n');
		const line = lines[i];

		if (line) result.push(line);
	}

	return result;
}

export function getBestRolePosition(session: Session | null) {
	if (!session || !session.roles) {
		return 0;
	}

	if (session.roles.length === 0) {
		return 0;
	}

	const bestRole = session.roles.reduce(
		(prev: Session['roles'][number] | undefined, cur: Session['roles'][number]) => {
		if (!prev) {
			return cur;
		}

		if (prev.level > cur.level) {
			return prev;
		}
		return cur;
	}, session.roles[0]);

	return bestRole?.level || 0;
}

export function isEndReached(element?: HTMLElement | null, offset: number = 100) {
	if (!element) {
		return false;
	}

	const endOffset = element.scrollHeight - element.scrollTop - element.clientHeight;

	return endOffset <= offset;
}

export function byteToString(byte: number) {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;
	while (byte >= 1024 && index < units.length - 1) {
		byte /= 1024;
		index++;
	}
	return `${byte.toFixed(2)} ${units[index]}`;
}

export function isJson(value: string) {
	try {
		return JSON.parse(value);
	} catch {
		return false;
	}
}

export function getFilename(filename: string) {
	return filename.split('/').pop() || '';
}

export function getFileExtension(filename: string) {
	const basename = filename.split('/').pop() || '';
	const dotIndex = basename.lastIndexOf('.');
	if (dotIndex <= 0) return '';
	return basename.slice(dotIndex + 1);
}

export function normalizePath(p: string | null | undefined): string {
	if (!p || p === '/') return '/';
	let normalized = p.startsWith('/') ? p : '/' + p;
	if (normalized.length > 1 && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}
	return normalized;
}

export function getParentPath(p: string | null | undefined): string {
	const normalized = normalizePath(p);
	if (normalized === '/') return '/';
	const parts = normalized.split('/');
	parts.pop();
	return parts.join('/') || '/';
}

export function parseServerFile(file: unknown): FileDto[] | string | ArrayBuffer {
	try {
		return z.array(fileDto).parse(file);
	} catch {
		if (file instanceof ArrayBuffer) {
			return file;
		}

		if (typeof file === 'string') {
			return file;
		}

		return JSON.stringify(file);
	}
}

export function levenshtein(a: string, b: string, caseInsensitive = false): number {
	if (caseInsensitive) {
		a = a.toLowerCase();
		b = b.toLowerCase();
	}

	// ensure a is the shorter string to minimize memory
	if (a.length > b.length) {
		[a, b] = [b, a];
	}

	const m = a.length;
	const n = b.length;

	// if one is empty, distance is the other's length
	if (m === 0) return n;
	if (n === 0) return m;

	// previous and current rows (length m+1)
	const prev = new Array<number>(m + 1);
	const curr = new Array<number>(m + 1);

	// initialize prev (distance from empty string to prefix of a)
	for (let i = 0; i <= m; i++) prev[i] = i;

	for (let j = 1; j <= n; j++) {
		curr[0] = j; // distance from prefix of b to empty a is j
		const bj = b.charAt(j - 1);

		for (let i = 1; i <= m; i++) {
			const ai = a.charAt(i - 1);
			const cost = ai === bj ? 0 : 1;
			// substitution = prev[i-1] + cost
			// insertion = curr[i-1] + 1
			// deletion = prev[i] + 1
			const substitute = prev[i - 1]! + cost;
			const insert = curr[i - 1]! + 1;
			const deleteOp = prev[i]! + 1;
			curr[i] = Math.min(substitute, insert, deleteOp);
		}

		// swap prev and curr for next iteration (reuse arrays)
		for (let k = 0; k <= m; k++) prev[k] = curr[k]!;
	}

	return prev[m]!;
}

function similarityScore(word: string, target: string): number {
	const w = word.toLowerCase();
	const t = target.toLowerCase();

	if (w === t) return 10000;
	if (w.startsWith(t)) return 5000;
	if (w.includes(t)) return 3000;

	const distance = levenshtein(w, t);

	return 1000 - distance;
}

export function sortByBestMatch<T>(words: T[], extract: (value: T) => string, target: string): T[] {
	return [...words].sort((a, b) => {
		return similarityScore(extract(b), target) - similarityScore(extract(a), target);
	});
}

const NEXT_HTTP_ERROR_FALLBACK = 'NEXT_HTTP_ERROR_FALLBACK';

export function isNextJsError(error: unknown): error is {
	message: string;
} {
	if (error && error instanceof Error) {
		if (error.message.includes(NEXT_HTTP_ERROR_FALLBACK)) return true;

		return isNextJsError(error.cause);
	}

	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message.includes(NEXT_HTTP_ERROR_FALLBACK);
	}

	return false;
}

export function isWebGLError(error: unknown): boolean {
	if (!error) return false;
	const message =
		error instanceof Error
			? error.message
			: typeof error === 'object' && 'message' in error && typeof error.message === 'string'
				? error.message
				: String(error);
	return message.includes('Error creating WebGL context') || message.includes('THREE.WebGLRenderer');
}

export function triggerBlobDownload(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

