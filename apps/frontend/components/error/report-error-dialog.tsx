'use client';

import dynamic from 'next/dynamic';

import { Suspense } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';

const ReportErrorForm = dynamic(() => import('@/components/error/report-error-form'));

export default function ReportErrorDialog({ children }: { children?: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild disabled>
				{children || (
					<span className="cursor-pointer text-foreground underline">
						<Tran text="report-error" />
					</span>
				)}
			</DialogTrigger>
			<Suspense>
				<DialogContent>
					<ReportErrorForm />
				</DialogContent>
			</Suspense>
		</Dialog>
	);
}
