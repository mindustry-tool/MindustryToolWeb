import type { Locale } from '@mindustry-tool/api';
import type { ReactNode } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Globe, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { PathList } from '@/app/[locale]/wiki/components/path-list';
import { WikiSearchInput } from '@/app/[locale]/wiki/components/wiki-search-input';
import { LocalLink } from '@/components/common/locale-link';
import LocaleSwitcher from '@/components/common/locale-switcher';
import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import ThemeSwitcher from '@/components/common/theme-switcher';
import { WebName } from '@/components/common/web-name';
import { GithubIcon } from '@/components/icons/github-icon';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import environment from '@/config/environment';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';

type Props = {
	params: Promise<{ locale: string }>;
	children: ReactNode;
};

export default async function Layout({ params, children }: Props) {
	const { locale } = await params;

	return (
		<div className="flex h-full flex-col">
			<div className="flex max-h-13 min-h-13 w-full items-center gap-3 border-b px-3">
				<div className="min-w-fit flex-1">
					<LocalLink href={routes.home} className="flex items-center gap-3">
						<MindustryToolIcon />
						<WebName />
					</LocalLink>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<div className="mx-auto flex h-9 w-full max-w-162 flex-99 items-center gap-1 rounded-2xl border bg-muted/50 text-muted-foreground hover:bg-muted">
							<Search className="ml-2" size={18} />
							<Tran text="search" />
						</div>
					</DialogTrigger>
					<DialogContent showCloseButton={false} className="top-[30%] gap-0 p-0">
						<WikiSearchInput />
					</DialogContent>
				</Dialog>
				<div className="flex flex-1 items-center justify-end gap-1">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon">
								<Globe />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>
								<Tran text="change-language" />
							</DialogTitle>
							<DialogDescription>
								<Tran text="change-language-description" />
							</DialogDescription>
							<LocaleSwitcher />
						</DialogContent>
					</Dialog>
					<ThemeSwitcher />
					<Button variant="ghost" size="icon" asChild>
						<Link href={environment.url.github}>
							<GithubIcon className="size-6" />
						</Link>
					</Button>
				</div>
			</div>
			<div className="flex h-full flex-col gap-4 overflow-hidden xl:grid xl:grid-cols-[1fr_auto_1fr]">
				<div className="max-w-80 min-w-64 flex-col gap-2 xl:ml-auto xl:h-full xl:overflow-y-auto">
					<Sheet>
						<SheetTrigger asChild>
							<Button className="mt-4 ml-4 inline-flex overflow-hidden xl:hidden" variant="ghost" size="icon">
								<Menu className="size-5" size={20} />
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle className="flex items-center gap-1.5">
									<MindustryToolIcon />
									<div className="grid">
										<WebName />
										<span className="text-xs text-muted-foreground">{environment.webVersion}</span>
									</div>
								</SheetTitle>
								<VisuallyHidden>
									<SheetDescription />
								</VisuallyHidden>
							</SheetHeader>
							<Suspense>
								<div className="px-4">
									<PathList language={locale as Locale} />
								</div>
							</Suspense>
						</SheetContent>
					</Sheet>
					<div className="hidden w-full p-4 xl:block">
						<Suspense>
							<PathList language={locale as Locale} />
						</Suspense>
					</div>
				</div>
				<Suspense>{children}</Suspense>
			</div>
		</div>
	);
}
