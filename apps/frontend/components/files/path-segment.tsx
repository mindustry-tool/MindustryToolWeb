import { buttonVariants } from "@/components/ui/button";
import { cn, normalizePath } from "@/lib/utils";

export function PathSegment({ path, setPath }: { path: string; setPath: (path: string) => void }) {
	const normalized = normalizePath(path);
	const segments = normalized.split('/').filter(Boolean);

	return (
		<span
			className={cn(
				buttonVariants({ variant: 'outline' }),
				'font-semibold rounded-sm flex-1 min-w-0 text-sm text-muted-foreground items-center flex overflow-x-auto justify-start px-3 h-9 gap-1'
			)}
		>
			<button
				className={cn('hover:text-foreground cursor-pointer text-nowrap', {
					'text-foreground': segments.length === 0,
				})}
				onClick={() => setPath('/')}
			>
				/
			</button>
			{segments.map((segment, index) => {
				const segmentPath = '/' + segments.slice(0, index + 1).join('/');
				const isLast = index === segments.length - 1;
				return (
					<span key={index} className="flex items-center gap-1">
						<button
							className={cn('hover:text-foreground cursor-pointer text-nowrap', {
								'text-foreground': isLast,
							})}
							onClick={() => setPath(segmentPath)}
						>
							{segment}
						</button>
						{!isLast && '/'}
					</span>
				);
			})}
		</span>
	);
}
