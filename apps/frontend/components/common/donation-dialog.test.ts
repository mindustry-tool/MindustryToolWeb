import { describe, expect, it } from 'vitest';
import {
	DONATION_DIALOG_STORAGE_KEY,
	isDonationCooldownActive,
	isDonationPath,
	SESSION_DELAY_MS,
	shouldShowDonationPrompt,
	THREE_DAYS_MS,
} from './donation-dialog.utils';

describe('donation-dialog logic', () => {
	const now = 1700000000000;

	it('should verify storage key and constant thresholds', () => {
		expect(DONATION_DIALOG_STORAGE_KEY).toBe('donation-dialog-state');
		expect(SESSION_DELAY_MS).toBe(60 * 1000);
		expect(THREE_DAYS_MS).toBe(3 * 24 * 60 * 60 * 1000);
	});

	describe('isDonationPath', () => {
		it('should recognize donation routes', () => {
			expect(isDonationPath('/donate')).toBe(true);
			expect(isDonationPath('/en/donate')).toBe(true);
			expect(isDonationPath('/vi/donate')).toBe(true);
		});

		it('should return false for other routes or empty path', () => {
			expect(isDonationPath('/')).toBe(false);
			expect(isDonationPath('/schematics')).toBe(false);
			expect(isDonationPath(null)).toBe(false);
			expect(isDonationPath(undefined)).toBe(false);
		});
	});

	describe('isDonationCooldownActive', () => {
		it('should return false if dialog was never shown', () => {
			expect(isDonationCooldownActive(0, now)).toBe(false);
			expect(isDonationCooldownActive(undefined, now)).toBe(false);
		});

		it('should return true if shown within the last 3 days', () => {
			const oneDayAgo = now - 24 * 60 * 60 * 1000;
			expect(isDonationCooldownActive(oneDayAgo, now)).toBe(true);

			const almostThreeDaysAgo = now - (THREE_DAYS_MS - 1000);
			expect(isDonationCooldownActive(almostThreeDaysAgo, now)).toBe(true);
		});

		it('should return false once 3 days have elapsed', () => {
			const exactlyThreeDaysAgo = now - THREE_DAYS_MS;
			expect(isDonationCooldownActive(exactlyThreeDaysAgo, now)).toBe(false);

			const fourDaysAgo = now - 4 * 24 * 60 * 60 * 1000;
			expect(isDonationCooldownActive(fourDaysAgo, now)).toBe(false);
		});
	});

	describe('shouldShowDonationPrompt', () => {
		it('should return false before component mounts or before timer elapses', () => {
			expect(
				shouldShowDonationPrompt({
					isMounted: false,
					isTimerElapsed: true,
					dontShowAgain: false,
					lastShownAt: 0,
					pathname: '/',
					now,
				}),
			).toBe(false);

			expect(
				shouldShowDonationPrompt({
					isMounted: true,
					isTimerElapsed: false,
					dontShowAgain: false,
					lastShownAt: 0,
					pathname: '/',
					now,
				}),
			).toBe(false);
		});

		it('should return false if user opted out with dontShowAgain', () => {
			expect(
				shouldShowDonationPrompt({
					isMounted: true,
					isTimerElapsed: true,
					dontShowAgain: true,
					lastShownAt: 0,
					pathname: '/',
					now,
				}),
			).toBe(false);
		});

		it('should return false if cooldown period is active', () => {
			expect(
				shouldShowDonationPrompt({
					isMounted: true,
					isTimerElapsed: true,
					dontShowAgain: false,
					lastShownAt: now - 1000 * 60 * 60, // 1 hour ago
					pathname: '/',
					now,
				}),
			).toBe(false);
		});

		it('should return false if user is currently on the donate page', () => {
			expect(
				shouldShowDonationPrompt({
					isMounted: true,
					isTimerElapsed: true,
					dontShowAgain: false,
					lastShownAt: 0,
					pathname: '/en/donate',
					now,
				}),
			).toBe(false);
		});

		it('should return true when all conditions are satisfied', () => {
			expect(
				shouldShowDonationPrompt({
					isMounted: true,
					isTimerElapsed: true,
					dontShowAgain: false,
					lastShownAt: now - (THREE_DAYS_MS + 1000), // > 3 days ago
					pathname: '/schematics',
					now,
				}),
			).toBe(true);
		});
	});
});
