import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { ToolName } from '@/app/[locale]/(with-navbar)/(everyone)/tools/components/tool-name';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

export default function Page({ children }: { children: ReactNode }) {
	return (
		<div className="h-full w-full overflow-y-auto p-4">
			<div className="mx-auto space-y-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href={routes.tools.value}>
								<Tran text="tools" />
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>
								<Suspense>
									<ToolName />
								</Suspense>
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				{children}
			</div>
		</div>
	);
}
