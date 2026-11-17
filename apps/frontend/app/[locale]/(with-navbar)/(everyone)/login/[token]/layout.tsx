import LoginButton from '@/components/buttons/login-button';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<ClientProtectedElement filter alt={<LoginButton />}>
			{children}
		</ClientProtectedElement>
	);
}
