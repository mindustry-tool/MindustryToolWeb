import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

export function useSearchStates() {
	const [state, setState] = useQueryStates({
		name: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		author: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		tags: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
		width: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(0).withOptions({ clearOnDefault: true }),
	});

	const wrapper: typeof setState = useCallback((value) => setState({ page: 0, ...value }), [setState]);

	return [state, wrapper] as const;
}
