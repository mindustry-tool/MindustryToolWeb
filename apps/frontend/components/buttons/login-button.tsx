import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import LoginProvider from '@/components/buttons/login-provider';
import DiscordIcon from '@/components/icons/discord-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import GooogleIcon from '@/components/icons/google-icon';

type LoginButtonProps = Parameters<typeof Button>[0];

export default function LoginButton({ children, asChild, ...props }: LoginButtonProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				{asChild ? (
					children
				) : (
					<Button {...props}>{children || <Tran text="login" />}</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="flex justify-center text-2xl">
					<Tran text="login" />
				</DialogTitle>
				<VisuallyHidden>
					<DialogDescription></DialogDescription>
				</VisuallyHidden>
				<div className="grid gap-2">
					<LoginProvider className="bg-[rgb(88,101,242)]" provider="discord">
						<DiscordIcon />
						<Tran text="login.login-with-discord" />
					</LoginProvider>
					<LoginProvider className="bg-[rgb(230,74,55)]" provider="google">
						<GooogleIcon className="size-5" />
						<Tran text="login.login-with-google" />
					</LoginProvider>
				</div>
			</DialogContent>
		</Dialog>
	);
}
