import type { ReactNode } from 'react';
import { TableOfContent } from '@/app/[locale]/wiki/[postId]/components/table-of-content';

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<TableOfContent />
		</>
	);
}
