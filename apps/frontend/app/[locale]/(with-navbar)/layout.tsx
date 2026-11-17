
import { Navbar } from '@/app/[locale]/components/navbar';
import { Suspense } from 'react';
type Props = {
	children: React.ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<Navbar>
			<Suspense>{children}</Suspense>
		</Navbar>
	);
}
