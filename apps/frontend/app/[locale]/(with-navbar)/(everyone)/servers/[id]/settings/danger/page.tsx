'use client';

import { useSettings } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/context';
import { DangerousServerSetting } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/settings/components/dangerous-server-setting';
import { Tran } from '@/i18n/tran';

export default function DangerPage() {
	const server = useSettings();

	return (
		<div className="flex flex-col gap-2">
			<Tran className="text-xl font-semibold" text="server.dangerous" />
			<DangerousServerSetting server={server} />
		</div>
	);
}
