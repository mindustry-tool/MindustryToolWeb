import { notFound } from 'next/navigation';
import { isNotFoundError } from '@/lib/utils';

export function throwNotFound(error: unknown): void {
	if (isNotFoundError(error)) {
		notFound();
	}
}
