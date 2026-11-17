import { PlusIcon } from 'lucide-react';

import { Suspense } from 'react';
import { MobileAddPostButton } from '@/app/[locale]/(with-navbar)/(everyone)/posts/components/add-post-button';
import { Posts } from '@/app/[locale]/(with-navbar)/(everyone)/posts/components/posts';
import { LocalLink } from '@/components/common/locale-link';
import Portal from '@/components/common/portal';
import { Container } from '@/components/layout/container';
import { SearchBar } from '@/components/search-bar/search-bar';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

export default function Post() {
	return (
		<Container>
			<Suspense>
				<SearchBar author tags="posts" />
				<Posts />
			</Suspense>
			<MobileAddPostButton />
			<Suspense>
				<Portal parentId="nav-header">
					<Button className="ml-auto hidden md:inline-flex" asChild>
						<LocalLink href={routes.newPost}>
							<PlusIcon size={20} />
							<Tran text="post.new-post" />
						</LocalLink>
					</Button>
				</Portal>
			</Suspense>
		</Container>
	);
}
