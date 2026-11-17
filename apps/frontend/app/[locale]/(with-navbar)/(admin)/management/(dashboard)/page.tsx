import ProtectedRoute from '@/components/layout/protected-route';

export default function Page() {
	return (
		<ProtectedRoute filter="god">
			<div className="h-full overflow-hidden">
				<iframe
					className="h-full w-full"
					src="https://analytic.mindustry-tool.com/public-dashboards/8c51cd5c5d1040da9563845bda0cf1be"
				/>
			</div>
		</ProtectedRoute>
	);
}
