import { UserMapList } from '@/app/[locale]/(with-navbar)/(everyone)/users/[id]/components/user-map-list';
import { UserSchematicList } from '@/app/[locale]/(with-navbar)/(everyone)/users/[id]/components/user-schematic-list';
import { PageWrapper } from '@/components/common/page-wrapper';
import ErrorMessage from '@/components/error/error-message';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserComponent, UserWithAvatarAndNameAndRole } from '@/components/user/user-component';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { throwNotFound } from '@/lib/error.utils';
import { formatTitle } from '@/lib/string.utils';
import { api } from '@mindustry-tool/api';
import { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

export async function generateMetadata({ params }: PageProps<'/[locale]/users/[id]'>): Promise<Metadata> {
	const { id } = await params;

	const [user, error] = await apiInstance.tryRequest(api.v4.users.getById, {
		params: {
			id,
		},
	});

	if (error) {
		return {
			title: String(error),
		};
	}

	return {
		title: formatTitle(user.name),
		openGraph: {
			title: formatTitle(user.name),
			images: user.imageUrl ? [user.imageUrl] : undefined,
		},
	};
}

export default async function Page({ params }: PageProps<'/[locale]/users/[id]'>) {
	const { id } = await params;

	const [user, error] = await apiInstance.tryRequest(api.v4.users.getById, {
		params: {
			id,
		},
	});

	throwNotFound(error);

	if (error) {
		return <ErrorMessage error={error} />;
	}

	return (
		<PageWrapper>
			<div className="p-2 bg-card rounded-md relative">
				<UserComponent data={user}>
					{user.thumbnailUrl && (
						<Image
							className="aspect-video rounded-lg"
							src={user.thumbnailUrl}
							width={1920}
							height={500}
							alt={user.name}
						/>
					)}
					<UserWithAvatarAndNameAndRole />
				</UserComponent>
			</div>
			<Tabs className="h-full overflow-hidden" defaultValue="schematic">
				<TabsList>
					<TabsTrigger value="schematic">
						<Tran text="schematic" />
					</TabsTrigger>
					<TabsTrigger value="map">
						<Tran text="map" />
					</TabsTrigger>
					{/* <TabsTrigger value="post">
						<Tran text="post" />
					</TabsTrigger> */}
				</TabsList>
				<Separator />
				<Suspense>
					<TabsContent className="h-full overflow-hidden" value="schematic">
						<UserSchematicList user={user} />
					</TabsContent>
					<TabsContent className="h-full overflow-hidden" value="map">
						<UserMapList user={user} />
					</TabsContent>
					{/* <TabsContent className="h-full overflow-hidden" value="post">
						<UnderConstructionIcon />
					</TabsContent> */}
				</Suspense>
			</Tabs>
		</PageWrapper>
	);
}
