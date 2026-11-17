'use client';

import { Suspense } from 'react';
import { InstalledMapList } from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/maps/components/installed-map-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tran } from '@/i18n/tran';
import { Separator } from '@/components/ui/separator';
import { useQueryState } from 'nuqs';

import DownloadMapList from '@/app/[locale]/(with-navbar)/(everyone)/servers/[id]/maps/components/download-map-list';

export default function Page() {
	return (
		<Suspense>
			<TabsWrapper>
				<TabsList>
					<TabsTrigger value="installed">
						<Tran text="map.installed" />
					</TabsTrigger>
					<TabsTrigger value="download">
						<Tran text="map.download" />
					</TabsTrigger>
				</TabsList>
				<Separator />
				<TabsContent className="flex h-full w-full flex-col overflow-y-auto" value="installed">
					<Suspense>
						<InstalledMapList />
					</Suspense>
				</TabsContent>
				<TabsContent className="flex h-full w-full flex-col overflow-y-auto" value="download">
					<Suspense>
						<DownloadMapList />
					</Suspense>
				</TabsContent>
			</TabsWrapper>
		</Suspense>
	);
}

function TabsWrapper({ children }: { children: React.ReactNode }) {
	const [tab, setTab] = useQueryState('tab', { defaultValue: 'installed' });

	return (
		<Tabs className="h-full w-full overflow-hidden p-4" value={tab} onValueChange={setTab} defaultValue="installed">
			{children}
		</Tabs>
	);
}
