import { COLORS } from '../constants/index.js';

export function formatWithParameter(message: string, key: string, data: unknown) {
  if (!message) {
    return '';
  }

  if (data === null) {
    return message.replaceAll(`\${${key}}`, 'null');
  }

  if (data === undefined) {
    return message.replaceAll(`\${${key}}`, 'undefined');
  }

  const isPrimitive = typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean';

  if (isPrimitive) {
    return message.replaceAll(`\${${key}}`, String(data));
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      message = formatWithParameter(message, key + '[' + i + ']', data[i]);
    }

    return message.replaceAll(`\${${key}}`, data.join(', '));
  }

  if (typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      message = formatWithParameter(message, key + '.' + k, v);
    }

    return message;
  }

  throw new Error('Unsupported data type:' + JSON.stringify(data));
}

export function stripColors(input: string): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === '[') {
      const length = parseColorMarkup(input, i + 1, input.length);
      if (length >= 0) {
        i += length + 2;
      } else {
        out += c;
        i++;
      }
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

function parseColorMarkup(str: string, start: number, end: number): number {
  if (start >= end) return -1;
  const first = str[start];
  if (first === '#') {
    for (let i = start + 1; i < end; i++) {
      const ch = str[i];
      if (ch === ']') {
        if (i < start + 2 || i > start + 9) break;
        return i - start;
      }
      if (!isHexDigit(ch)) break;
    }
    return -1;
  }
  if (first === '[') return -2;
  if (first === ']') return 0;
  for (let i = start + 1; i < end; i++) {
    if (str[i] !== ']') continue;
    if (COLORS[str.slice(start, i)] === undefined) return -1;
    return i - start;
  }
  return -1;
}

function isHexDigit(ch: string | undefined): boolean {
  return (
    ch !== undefined && ((ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F'))
  );
}

export * from './auth.js';
