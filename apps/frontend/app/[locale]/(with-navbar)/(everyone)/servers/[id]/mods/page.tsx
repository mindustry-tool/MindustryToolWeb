import { Suspense } from 'react';
import { InstalledModList } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/mods/components/installed-mod-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tran } from '@/i18n/tran';
import { Separator } from '@/components/ui/separator';

import DownloadModList from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/mods/components/download-mod-list';

export default function Page() {
	return (
		<Tabs className="h-full w-full overflow-hidden p-4" defaultValue="installed">
			<TabsList>
				<TabsTrigger value="installed">
					<Tran text="mod.installed" />
				</TabsTrigger>
				<TabsTrigger value="download">
					<Tran text="mod.download" />
				</TabsTrigger>
			</TabsList>
			<Separator />
			<TabsContent className="flex h-full w-full flex-col overflow-y-auto rounded-lg" value="installed">
				<Suspense>
					<InstalledModList />
				</Suspense>
			</TabsContent>
			<TabsContent className="flex h-full w-full flex-col overflow-y-auto rounded-lg" value="download">
				<Suspense>
					<DownloadModList />
				</Suspense>
			</TabsContent>
		</Tabs>
	);
}
