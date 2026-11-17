import { cn } from '@/lib/utils';
import { ApiError } from '@mindustry-tool/api';
import { Tran } from '@/i18n/tran';

export default function ErrorMessage({ className, error }: { className?: string; error: unknown }) {
	if (error && error instanceof ApiError) {
		if (error.response.status === 404 || error.response.status === 418) {
			console.error(error);
		}

		if (error.response.status === 403) {
			return (
				<p className={cn('text-destructive m-auto p-4 max-w-lg', className)}>
					You are not authorized to access this resource
				</p>
			);
		}

		if (error.response.status === 600) {
			return (
				<p className={cn('text-destructive m-auto p-4 max-w-lg', className)}>
					<Tran text="can-not-connect-to-server" />
				</p>
			);
		}
	}

	const message = String(error);

	console.error(error);

	return <p className={cn('text-destructive m-auto p-4 max-w-xl text-wrap', className)}>{message}</p>;
}
