import LoginProvider from '@/components/buttons/login-provider';
import DiscordIcon from '@/components/icons/discord-icon';
import { Tran } from '@/i18n/tran';
import { Metadata } from 'next';

export const metadata: Metadata = {
	robots: {
		index: false,
	},
};

export default function Page() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2 overflow-y-auto p-4">
			<Tran className="text-2xl font-semibold" text="login" />
			<div className="grid w-fit gap-2">
				<LoginProvider provider="discord">
					<DiscordIcon />
					<Tran text="login.login-with-discord" />
				</LoginProvider>
			</div>
		</div>
	);
}
