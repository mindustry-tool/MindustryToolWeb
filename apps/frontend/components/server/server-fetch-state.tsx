import ErrorMessage from '@/components/error/error-message';
import NotFoundCard from '@/components/common/not-found-card';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Tran } from '@/i18n/tran';
import { isNotFoundError } from '@/lib/utils';

export { isNotFoundError };

export function ServerError({ error }: { error: unknown }) {
	if (isNotFoundError(error)) {
		return <NotFoundCard />;
	}

	return <ErrorMessage error={error} />;
}

type FetchStateProps = {
	isLoading?: boolean;
	isError?: boolean;
	error?: unknown;
	data?: unknown;
	notFoundText?: string;
};

export function ServerFetchState({ isLoading, isError, error, data }: FetchStateProps) {
	if (isError) {
		return <ServerError error={error} />;
	}

	if (isLoading || !data) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				{isLoading ? <LoadingSpinner /> : <Tran text="not-found" />}
			</div>
		);
	}

	return null;
}
