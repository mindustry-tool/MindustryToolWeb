'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import GlobalErrorPage from '@/components/error/global-error-page';
import './globals.css';

export default function GlobalError({ error, reset }: { error: unknown; reset?: () => void }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en" className="dark h-full w-full" data-color-mode="dark">
			<body className="h-full w-full overflow-hidden bg-[#0D0D10] font-sans text-foreground antialiased m-0 p-0">
				<GlobalErrorPage error={error} onRetry={reset} />
			</body>
		</html>
	);
}
