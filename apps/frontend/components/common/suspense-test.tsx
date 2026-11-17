import { Suspense } from 'react';

export function SuspenseTest({
	children,
	suspenseId,
	fallback,
	...props
}: React.ComponentProps<typeof Suspense> & { suspenseId: string }) {
	return (
		<Suspense {...props} fallback={<Test suspenseId={suspenseId}>{fallback}</Test>}>
			{children}
		</Suspense>
	);
}

function Test({ children }: { suspenseId: string; children: React.ReactNode }) {
	return <div>{children}</div>;
}
