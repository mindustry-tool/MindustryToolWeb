'use client';

import { useSettings } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/context';
import { AdminServerSettingForm } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/admin-server-setting-form';
import { Tran } from '@/i18n/tran';
import environment from '@/config/environment';
import Link from 'next/link';

export default function AdminSettingsPage() {
	const server = useSettings();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<Tran className="text-xl font-semibold" text="server.advanced" />
				<p className="text-sm text-muted-foreground">
					<Tran text="server.contact-admin-desc" />
					<Link className="underline text-[#5865F2] ml-1" href={environment.url.discordServer}>
						Discord
					</Link>
				</p>
			</div>
			<AdminServerSettingForm server={server} />
		</div>
	);
}
