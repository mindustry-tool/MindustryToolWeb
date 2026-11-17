import ProtectedRoute from '@/components/layout/protected-route';
import { Tran } from '@/i18n/tran';

export default function Page() {
	return (
		<ProtectedRoute filter="god">
			<div>
				<h1><Tran text="reports" /></h1>
			</div>
		</ProtectedRoute>
	);
}
