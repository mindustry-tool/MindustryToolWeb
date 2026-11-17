import { PlusIcon } from 'lucide-react';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';

export function MobileAddPostButton() {
	return (
		<LocalLink
			className="fixed right-4 bottom-4 m-2 inline-flex aspect-square w-10 items-center justify-center rounded-full border bg-primary text-primary-foreground md:hidden"
			href={routes.newPost}
		>
			<PlusIcon size={20} />
			<span className="sr-only">New post</span>
		</LocalLink>
	);
}
