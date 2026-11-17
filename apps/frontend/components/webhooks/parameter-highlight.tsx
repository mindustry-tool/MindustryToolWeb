import type { ReactNode } from 'react';

export function ParameterHighlight({ text }: { text: string }) {
	// match ${parameter}
	const regex = /(\${[a-zA-Z\.]+})/g;

	const matches = text.matchAll(regex);
	const result: ReactNode[] = [];

	let lastEnd = 0;

	for (const match of matches) {
		const parameter = match[1];
		const before = match.index;
		const after = match.index + match[0].length;

		if (before > lastEnd) {
			result.push(text.slice(lastEnd, before));
		}
		result.push(
			<span key={before} className="text-primary">
				{parameter}
			</span>,
		);
		lastEnd = after;
	}

	if (lastEnd < text.length) {
		result.push(text.slice(lastEnd));
	}

	return <span className="whitespace-pre-wrap font-mono break-all">{result}</span>;
}
