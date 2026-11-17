'use client';

import Link from 'next/link';
import environment from '@/config/environment';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type LoginProviderProps = {
	provider: string;
	className?: string;
	children: React.ReactNode;
};

export default function LoginProvider({ className, provider, children }: LoginProviderProps) {
	return (
		<Button asChild variant="outline">
			<Link className={cn(className)} href={`${environment.url.apiV4}/auth/${provider}`}>
				{children}
			</Link>
		</Button>
	);
}
