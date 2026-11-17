'use client';

import { ThemeProvider as WrkszThemeProvider, type ThemeProviderProps } from '@wrksz/themes/next';
import { useTheme as useWrkszTheme } from '@wrksz/themes/client';

export type AppTheme = 'light' | 'dark' | 'gradient';

export function ThemeProvider<Themes extends string = AppTheme>({ children, ...props }: ThemeProviderProps<Themes>) {
	return <WrkszThemeProvider {...props}>{children}</WrkszThemeProvider>;
}

export function useTheme<Themes extends string = AppTheme>() {
	return useWrkszTheme<Themes>();
}
