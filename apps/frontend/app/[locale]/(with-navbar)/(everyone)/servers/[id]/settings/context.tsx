'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { createContext, use, type ReactNode } from 'react';

type SettingsContextValue = {
	server: ServerDto;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

SettingsContext.displayName = 'SettingsContext';

export function useSettings(): ServerDto {
	const context = use(SettingsContext);

	if (!context) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}

	return context.server;
}

export function SettingsProvider({ server, children }: { server: ServerDto; children: ReactNode }) {
	return <SettingsContext value={{ server }}>{children}</SettingsContext>;
}
