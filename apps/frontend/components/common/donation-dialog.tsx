'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useIsMounted, useLocalStorage } from 'usehooks-ts';
import { Heart } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import {
	DEFAULT_STORAGE,
	DONATION_DIALOG_STORAGE_KEY,
	DonationDialogStorage,
	SESSION_DELAY_MS,
	shouldShowDonationPrompt,
} from './donation-dialog.utils';

export default function DonationDialog() {
	const isMounted = useIsMounted();
	const pathname = usePathname();

	const [storageState, setStorageState] = useLocalStorage<DonationDialogStorage>(
		DONATION_DIALOG_STORAGE_KEY,
		DEFAULT_STORAGE,
		{
			initializeWithValue: false,
		},
	);

	const [isTimerElapsed, setIsTimerElapsed] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowAgainChecked, setDontShowAgainChecked] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsTimerElapsed(true);
		}, SESSION_DELAY_MS);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	const shouldShow = useMemo(() => {
		return shouldShowDonationPrompt({
			isMounted: isMounted(),
			isTimerElapsed,
			dontShowAgain: Boolean(storageState?.dontShowAgain),
			lastShownAt: storageState?.lastShownAt,
			pathname,
		});
	}, [isMounted, isTimerElapsed, storageState?.dontShowAgain, storageState?.lastShownAt, pathname]);

	useEffect(() => {
		if (shouldShow && !isOpen) {
			setTimeout(() => {
				setIsOpen(true);
			}, 0);
		}
	}, [shouldShow, isOpen]);

	const handleDismiss = () => {
		setStorageState({
			dontShowAgain: dontShowAgainChecked,
			lastShownAt: Date.now(),
		});
		setIsOpen(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			handleDismiss();
		} else {
			setIsOpen(true);
		}
	};

	if (!isMounted()) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="flex flex-col items-center text-center gap-3">
					<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
						<Heart className="size-7 fill-primary/20 text-primary" />
					</div>
					<DialogTitle className="text-xl font-bold">
						<Tran text="donate.dialog-title" />
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						<Tran text="donate.dialog-description" />
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2 py-2">
					<Checkbox
						id="dont-show-again-checkbox"
						checked={dontShowAgainChecked}
						onCheckedChange={(checked) => setDontShowAgainChecked(Boolean(checked))}
					/>
					<Label
						htmlFor="dont-show-again-checkbox"
						className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
					>
						<Tran text="donate.dont-show-again" />
					</Label>
				</div>

				<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
					<Button variant="outline" onClick={handleDismiss}>
						<Tran text="donate.dialog-dismiss" />
					</Button>
					<Button asChild onClick={handleDismiss}>
						<LocalLink href={routes.donate}>
							<Heart className="size-4 fill-rose-400/30 text-rose-400" />
							<Tran text="donate.dialog-cta" />
						</LocalLink>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
