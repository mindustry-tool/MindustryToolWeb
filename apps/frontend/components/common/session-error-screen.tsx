import ErrorMessage from '@/components/error/error-message';
import ReportErrorDialog from '@/components/error/report-error-dialog';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import { useQueryClient } from '@tanstack/react-query';

export default function SessionErrorScreen({ error, isFetching }: { error: unknown; isFetching: boolean }) {
	const queryClient = useQueryClient();

	return (
		<div className="fixed z-50 flex h-full w-full flex-col items-center justify-center backdrop-blur-xl backdrop-brightness-50">
			<ErrorMessage className="m-0" error={error} />
			<div className="grid grid-cols-2 items-center gap-2">
				<Button
					variant="outline"
					onClick={async () => {
						queryClient.invalidateQueries();
					}}
					disabled={isFetching}
				>
					{isFetching ? <LoadingSpinner /> : <Tran text="refresh" />}
				</Button>
				<ReportErrorDialog>
					<Button>
						<Tran text="report-error" />
					</Button>
				</ReportErrorDialog>
			</div>
		</div>
	);
}
