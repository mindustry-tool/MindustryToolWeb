import { routes } from '@/config/routes';

export const DONATION_DIALOG_STORAGE_KEY = 'donation-dialog-state';
export const SESSION_DELAY_MS = 60 * 1000;
export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export interface DonationDialogStorage {
	dontShowAgain: boolean;
	lastShownAt: number;
}

export const DEFAULT_STORAGE: DonationDialogStorage = {
	dontShowAgain: false,
	lastShownAt: 0,
};

export function isDonationCooldownActive(lastShownAt: number | undefined, now = Date.now()): boolean {
	if (!lastShownAt) return false;
	return now - lastShownAt < THREE_DAYS_MS;
}

export function isDonationPath(pathname: string | null | undefined): boolean {
	if (!pathname) return false;
	return pathname === routes.donate || pathname.endsWith(routes.donate);
}

export function shouldShowDonationPrompt({
	isMounted,
	isTimerElapsed,
	dontShowAgain,
	lastShownAt,
	pathname,
	now = Date.now(),
}: {
	isMounted: boolean;
	isTimerElapsed: boolean;
	dontShowAgain: boolean;
	lastShownAt?: number;
	pathname?: string | null;
	now?: number;
}): boolean {
	if (!isMounted || !isTimerElapsed) return false;
	if (dontShowAgain) return false;
	if (isDonationCooldownActive(lastShownAt, now)) return false;
	if (isDonationPath(pathname)) return false;
	return true;
}
