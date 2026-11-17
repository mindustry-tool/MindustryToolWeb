import { Suspense } from 'react';
import { GitHubUploadsList } from '@/app/[locale]/(with-navbar)/(admin)/data/github-uploads/components/github-uploads-list';
import { Separator } from '@/components/ui/separator';
import { Tran } from '@/i18n/tran';
import { PageWrapper } from '@/components/common/page-wrapper';
import ClientProtectedElement from '@/components/layout/client-protected-element';

export default function GitHubUploadsPage() {
	return (
		<Suspense>
			<ClientProtectedElement filter="god">
				<PageWrapper>
					<Tran className="text-xl font-semibold" text="github-uploads" />
					<Separator />
					<GitHubUploadsList />
				</PageWrapper>
			</ClientProtectedElement>
		</Suspense>
	);
}
