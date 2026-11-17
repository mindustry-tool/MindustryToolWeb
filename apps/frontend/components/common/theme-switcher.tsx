'use client';

import type { ReactNode } from 'react';
import { Aperture } from 'lucide-react';
import { useTheme, type AppTheme } from '@/theme/theme.provider';
import { Suspense, useState } from 'react';

import { Hydrated } from '@/components/common/hydrated';

import { MoonStarIcon } from '@/components/icons/moon-star-icon';
import { SunIcon } from '@/components/icons/sun-icon';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/i18n/i18n.client';

const themes: Record<AppTheme, ReactNode> = {
	light: <SunIcon suppressHydrationWarning />,
	dark: <MoonStarIcon suppressHydrationWarning />,
	gradient: <Aperture suppressHydrationWarning />,
};

export default function ThemeSwitcher({ ...props }: React.ComponentProps<typeof Button>) {
	const { theme, setTheme } = useTheme();
	const { t } = useI18n();
	const [open, setOpen] = useState(false);

	const activeIcon = theme && theme in themes ? themes[theme as AppTheme] : themes.light;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Hydrated>
				<PopoverTrigger asChild>
					<Button aria-label={t('theme-switcher')} variant="ghost" size="icon" {...props}>
						{activeIcon}
					</Button>
				</PopoverTrigger>
			</Hydrated>
			<Suspense>
				<PopoverContent className="flex w-50 flex-col gap-1 p-1">
					{(Object.entries(themes) as [AppTheme, ReactNode][]).map(([themeName, icon]) => (
						<Button
							key={themeName}
							className="justify-start capitalize"
							variant={themeName === theme ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => {
								setTheme(themeName);
								setOpen(false);
							}}
						>
							{icon}
							{themeName}
						</Button>
					))}
				</PopoverContent>
			</Suspense>
		</Popover>
	);
}
