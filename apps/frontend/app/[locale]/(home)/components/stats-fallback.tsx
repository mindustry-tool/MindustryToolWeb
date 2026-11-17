export default function StatsFallback() {
	return (
		<div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{/* Schematics Skeleton */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
					<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/10 animate-pulse" />
					<div className="mb-2 h-10 w-24 mx-auto rounded bg-white/10 animate-pulse" />
					<div className="h-6 w-32 mx-auto rounded bg-white/10 animate-pulse" />
				</div>

				{/* Maps Skeleton */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
					<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/10 animate-pulse" />
					<div className="mb-2 h-10 w-24 mx-auto rounded bg-white/10 animate-pulse" />
					<div className="h-6 w-32 mx-auto rounded bg-white/10 animate-pulse" />
				</div>

				{/* Servers Skeleton */}
				<div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
					<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/10 animate-pulse" />
					<div className="mb-2 h-10 w-24 mx-auto rounded bg-white/10 animate-pulse" />
					<div className="h-6 w-32 mx-auto rounded bg-white/10 animate-pulse" />
				</div>
			</div>
		</div>
	);
}
