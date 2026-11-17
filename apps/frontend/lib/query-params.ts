import type { ReadonlyURLSearchParams } from 'next/navigation';
import { type z, ZodMiniObject } from 'zod/v4-mini';

export type QueryParam<T> = T | z.infer<T> | (Partial<z.input<T>> | Partial<z.infer<T>> | T)[];

export function mergeQueryParams<TQuery>(
	searchParams: ReadonlyURLSearchParams | Partial<z.infer<TQuery>>,
	queryParam: QueryParam<TQuery> | undefined,
): z.infer<TQuery> {
	if (queryParam === undefined) {
		return searchParams as z.infer<TQuery>;
	}

	if (searchParams instanceof Promise) {
		throw new TypeError('searchParams must be awaited: ' + searchParams);
	}

	let obj: Record<string, string | string[]> = {};

	if ('keys' in searchParams) {
		for (const key of searchParams.keys()) {
			const allValues = searchParams.getAll(key);
			obj[key] = allValues.length > 1 ? allValues : allValues[0]!;
		}
	} else {
		obj = searchParams as Record<string, string | string[]>;
	}

	let result = obj;

	const params = Array.isArray(queryParam) ? queryParam : [queryParam];

	for (const schema of params) {
		if (schema instanceof ZodMiniObject) {
			try {
				const parsed = schema.parse(result) as object;
				result = parsed as Record<string, string | string[]>;
			} catch (error) {
				console.error(error);
				console.error({ result });
			}
		} else if (schema instanceof Object) {
			result = {
				...result,
				...schema,
			};
		} else {
			throw new TypeError(`Invalid query param:${schema}`);
		}
	}

	return result as z.infer<TQuery>;
}
