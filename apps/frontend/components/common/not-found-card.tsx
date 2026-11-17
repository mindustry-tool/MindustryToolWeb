'use client';

import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LocalLink } from '@/components/common/locale-link';
import { NotFoundIllustration } from '@/components/common/not-found-illustration';
import { routes } from '@/config/routes';

const BackButton = dynamic(() => import('@/components/buttons/back-button'), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Tran = dynamic(() => import('@/i18n/tran').then((mod) => mod.Tran), { ssr: false });

export default function NotFoundCard() {
	return (
		<div className="pointer-events-none z-40 flex h-full flex-1 flex-col items-center justify-center gap-4 text-white">
			<NotFoundIllustration />
			<div className="pointer-events-auto">
				<h2 className="text-bold text-3xl">
					<Tran text="not-found" />
				</h2>
				<p>
					<Tran text="not-found-description" />
				</p>
				<div className="mt-2 grid grid-cols-2 gap-2">
					<BackButton>
						<ArrowLeft className="size-5" />
						<Tran text="back" />
					</BackButton>
					<Button variant="outline" asChild>
						<LocalLink href={routes.home}>
							<Tran text="home" />
						</LocalLink>
					</Button>
				</div>
			</div>
		</div>
	);
}
