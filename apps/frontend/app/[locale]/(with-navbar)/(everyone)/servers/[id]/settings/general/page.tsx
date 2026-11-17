'use client';

import { useSettings } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/context';
import { UpdateServerForm } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/update-server-form';
import { ServerGroupInfo } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/server-group-info';
import { Tran } from '@/i18n/tran';

export default function GeneralPage() {
	const server = useSettings();

	return (
		<div className="flex flex-col">
			<Tran className="text-xl font-semibold" text="server.general" />
			<UpdateServerForm server={server} />
			<Tran className="text-xl font-semibold mt-4" text="server.group" />
			<ServerGroupInfo server={server} />
		</div>
	);
}
