import ProtectedRoute from '@/components/layout/protected-route';
import { Tran } from '@/i18n/tran';

export default function Page() {
	return (
		<ProtectedRoute filter="god">
			<div className="flex h-full flex-col items-center justify-center gap-2 overflow-y-auto p-4">
				<Tran className="text-2xl font-semibold" text="bugs" />
			</div>
		</ProtectedRoute>
	);
}
