'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { useI18n } from '@/i18n/i18n.client';
import { cn } from '@/lib/utils';

export default function BackButton({ className, children, ...props }: Omit<Parameters<typeof Button>[0], 'title'>) {
	const router = useRouter();
	const { t } = useI18n();

	return (
		<Button
			className={cn('gap-1 whitespace-nowrap text-nowrap', className)}
			title={t('back')}
			{...props}
			onClick={() => router.back()}
		>
			{children}
		</Button>
	);
}
