export function NotFoundIllustration() {
	return (
		<div className="relative mx-auto w-full max-w-md">
			<svg viewBox="0 0 400 300" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
				{/* Background circles */}
				<circle cx="100" cy="100" r="60" fill="currentColor" className="text-blue-100 dark:text-blue-900/20" />
				<circle cx="300" cy="200" r="40" fill="currentColor" className="text-purple-100 dark:text-purple-900/20" />

				{/* Main 404 text */}
				<text
					x="200"
					y="150"
					textAnchor="middle"
					className="fill-slate-200 text-8xl font-bold dark:fill-slate-800"
					style={{ fontSize: '72px' }}
				>
					404
				</text>

				{/* Floating elements */}
				<rect
					x="50"
					y="50"
					width="20"
					height="20"
					rx="4"
					fill="currentColor"
					className="animate-pulse text-emerald-300 dark:text-emerald-700"
				/>
				<circle
					cx="350"
					cy="100"
					r="8"
					fill="currentColor"
					className="animate-bounce text-pink-300 dark:text-pink-700"
				/>
				<polygon
					points="320,250 340,280 300,280"
					fill="currentColor"
					className="text-yellow-300 dark:text-yellow-700"
				/>

				{/* Search icon */}
				<circle
					cx="200"
					cy="220"
					r="25"
					stroke="currentColor"
					strokeWidth="3"
					fill="none"
					className="text-slate-400 dark:text-slate-600"
				/>
				<line
					x1="220"
					y1="240"
					x2="235"
					y2="255"
					stroke="currentColor"
					strokeWidth="3"
					className="text-slate-400 dark:text-slate-600"
				/>
			</svg>
		</div>
	);
}
