import { cn } from '@/lib/utils';

export function DropdownCard({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'absolute p-2 w-full border border-input bg-secondary max-h-[80dvh] text-foreground overflow-y-auto overflow-x-hidden overscroll-none transition-colors rounded-lg mt-2 z-20 text-sm',
				className,
			)}
			{...props}
			onKeyUp={(event) => {
				if (event.key === 'ArrowDown' || event.key === 'Tab') {
					const currentFocus = document.activeElement as HTMLElement;
					currentFocus.tabIndex = -1;
					const nextFocus = currentFocus.nextElementSibling as HTMLElement;
					if (nextFocus) {
						nextFocus.tabIndex = 0;
						nextFocus.focus();
					}
				} else if (event.key === 'ArrowUp') {
					const currentFocus = document.activeElement as HTMLElement;
					currentFocus.tabIndex = -1;
					const prevFocus = currentFocus.previousElementSibling as HTMLElement;
					if (prevFocus) {
						prevFocus.tabIndex = 0;
						prevFocus.focus();
					} else {
						const modes = document.querySelectorAll('.arrow-selector');

						if (modes.length > 0 && modes[0] instanceof HTMLElement) {
							modes[0].focus();
						}
					}
				} else if (event.key === 'Enter') {
					const currentFocus = document.activeElement as HTMLElement;
					currentFocus.click();
				}
				event.preventDefault();
				event.stopPropagation();

				return true;
			}}
		>
			{children}
		</div>
	);
}
