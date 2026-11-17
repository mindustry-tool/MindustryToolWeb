'use client';

import type { ToasterProps } from 'sonner';
import { useTheme } from '@/theme/theme.provider';
import { Toaster as Sonner, toast } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			toastOptions={{
				classNames: {
                    toast: 'select-none',
					success: 'text-success',
				},
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
            duration={10000}
			{...props}
		/>
	);
};

export { toast, Toaster };
