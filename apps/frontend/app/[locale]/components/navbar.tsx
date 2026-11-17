'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Bell, ChevronRight, EllipsisVertical, HardDriveIcon, LogOut, Settings, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoginButton from '@/components/buttons/login-button';
import ColorText from '@/components/common/color-text';
import { LocalLink } from '@/components/common/locale-link';
import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import ThemeSwitcher from '@/components/common/theme-switcher';
import { WebName } from '@/components/common/web-name';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Sidebar, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar-client';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentUserComponent, UserWithAvatarAndNameAndRole } from '@/components/user/user-component';
import type {
	NavGroup,
	NavGroupActionItem,
	NavGroupMultipleItem,
	NavGroupSingleItem,
} from '@/app/[locale]/components/nav-groups';
import { bottomGroup } from '@/app/[locale]/components/nav-groups';
import { NavProvider, NavSessionScope, useNavContext, useNavGroups } from '@/app/[locale]/components/nav-context';
import environment from '@/config/environment';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { NavbarNotificationBell } from '@/app/[locale]/components/navbar-notification-bell';

export function Navbar({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider className="flex h-full w-full flex-col overflow-hidden">
			<MobileNavAutoClose />
			<div className="flex h-full w-full overflow-hidden">
				<NavProvider>
					<Sidebar collapsible="icon">
						<SidebarHeader>
							<SidebarMenu>
								<SidebarMenuItem>
									<NavbarBanner />
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarHeader>
						<SidebarContent>
							<Suspense>
								<NavSessionScope>
									<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
										<NavGroups />
									</div>
									<NavGroupList className="mt-auto shrink-0 border-t" data={bottomGroup} />
								</NavSessionScope>
							</Suspense>
						</SidebarContent>
						<SidebarFooter className="border-t">
							<UserBanner />
						</SidebarFooter>
					</Sidebar>
				</NavProvider>
				<div className="flex w-full flex-col overflow-hidden">
					<div className="flex max-h-13 min-h-13 items-center border-b p-2">
						<SidebarTrigger className="mr-auto" />
						<div className="flex h-full w-full gap-2" id="nav-header" />
						<NavbarNotificationBell />
						<ThemeSwitcher />
					</div>
					{children}
				</div>
			</div>
		</SidebarProvider>
	);
}

function MobileNavAutoClose() {
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();
	const prevPathnameRef = useRef(pathname);

	useEffect(() => {
		if (prevPathnameRef.current !== pathname) {
			prevPathnameRef.current = pathname;
			if (isMobile) {
				setOpenMobile(false);
			}
		}
	}, [pathname, isMobile, setOpenMobile]);

	return null;
}

function useActiveNavLink() {
	const pathname = usePathname();
	const { locale } = useParams();
	const groups = useNavGroups();

	return useMemo(() => {
		const currentLocale = typeof locale === 'string' ? locale : '';
		let cleanPath = pathname;
		if (currentLocale && cleanPath.startsWith(`/${currentLocale}`)) {
			cleanPath = cleanPath.substring(currentLocale.length + 1);
		}
		if (!cleanPath.startsWith('/')) {
			cleanPath = `/${cleanPath}`;
		}
		if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
			cleanPath = cleanPath.slice(0, -1);
		}

		const allGroupsList = [...groups, bottomGroup];
		const links: string[] = [];
		for (const group of allGroupsList) {
			for (const item of group.items) {
				if ('link' in item && item.link) {
					links.push(item.link);
				} else if ('items' in item && Array.isArray(item.items)) {
					for (const subItem of item.items) {
						if (subItem.link) {
							links.push(subItem.link);
						}
					}
				}
			}
		}

		let bestMatch: string | null = null;
		let bestScore = -1;

		for (const link of links) {
			let normalizedLink = link.startsWith('/') ? link : `/${link}`;
			if (normalizedLink.length > 1 && normalizedLink.endsWith('/')) {
				normalizedLink = normalizedLink.slice(0, -1);
			}

			if (normalizedLink === '/' || normalizedLink === '') {
				if (cleanPath === '/' || cleanPath === '') {
					const score = 1000;
					if (score > bestScore) {
						bestScore = score;
						bestMatch = link;
					}
				}
			} else {
				if (cleanPath === normalizedLink) {
					const score = 2000 + normalizedLink.length;
					if (score > bestScore) {
						bestScore = score;
						bestMatch = link;
					}
				} else if (cleanPath.startsWith(`${normalizedLink}/`)) {
					const score = 1000 + normalizedLink.length;
					if (score > bestScore) {
						bestScore = score;
						bestMatch = link;
					}
				}
			}
		}

		return bestMatch;
	}, [pathname, locale, groups]);
}

function NavGroups() {
	const groups = useNavGroups();
	const activeLink = useActiveNavLink();

	return (
		<>
			{groups.map((group, index) => (
				<NavGroupList key={`${index}-${group.items.length}`} data={group} activeLink={activeLink} />
			))}
		</>
	);
}

function NavbarBanner() {
	const nav = useNavContext();

	if (nav.mode === 'server') {
		return (
			<div className="flex h-10 items-center gap-2">
				{nav.serverAvatar ? (
					<Image
						src={nav.serverAvatar}
						alt=""
						width={20}
						height={20}
						className="size-5 shrink-0 rounded-sm min-w-5 object-cover"
					/>
				) : (
					<HardDriveIcon className="size-5 shrink-0" />
				)}
				<div className="flex min-w-0 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
					{nav.serverName ? (
						<>
							<ColorText className="truncate font-medium" text={nav.serverName} />
							{nav.serverIsOfficial && <span className="text-xs text-muted-foreground"><Tran text="official" /></span>}
						</>
					) : (
						<Skeleton className="h-4 w-full" />
					)}
				</div>
				<SidebarTrigger className="ml-auto inline-flex md:hidden" />
			</div>
		);
	}

	return <WebBanner />;
}

function WebBanner() {
	return (
		<div className="flex items-center gap-2">
			<MindustryToolIcon className="shrink-0" width={32} height={32} />
			<div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
				<WebName />
				<span className="text-xs text-muted-foreground">{environment.webVersion}</span>
			</div>
			<SidebarTrigger className="ml-auto inline-flex md:hidden" />
		</div>
	);
}

function NavGroupList({
	data,
	className,
	activeLink,
}: {
	className?: string;
	data: NavGroup;
	activeLink?: string | null;
}) {
	const { groupName, items } = data;
	const currentActiveLink = useActiveNavLink();
	const resolvedActiveLink = activeLink !== undefined ? activeLink : currentActiveLink;

	const filters = data.items
		.flatMap((f) =>
			'items' in f //
				? f.items.map((r) => r.filter)
				: f.filter,
		)
		.filter((f) => f !== undefined);

	const show = data.items
		.flatMap((f) =>
			'items' in f //
				? f.items.map((r) => r.filter)
				: f.filter,
		)
		.includes(undefined);

	return (
		<AccessFilter filter={show ? undefined : { any: filters }}>
			<SidebarGroup className={className}>
				{groupName && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
				<SidebarGroupContent>
					<SidebarMenu>
						{items.map((item, index) =>
							'items' in item ? (
								<NavGroupMultipleItemList key={`${index}-multiple`} item={item} activeLink={resolvedActiveLink} />
							) : 'link' in item ? (
								<NavGroupSingleItemList key={`${index}-${item.link}`} item={item} activeLink={resolvedActiveLink} />
							) : (
								<NavGroupActionItemList key={`${index}-action`} item={item} />
							),
						)}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</AccessFilter>
	);
}

function NavGroupActionItemList({ item: { filter, action } }: { item: NavGroupActionItem }) {
	return <AccessFilter filter={filter}>{action}</AccessFilter>;
}

function NavGroupSingleItemList({
	item: { filter, link, label, badge, icon, className },
	activeLink,
}: {
	item: NavGroupSingleItem;
	activeLink?: string | null;
}) {
	const isActive = activeLink === link;

	return (
		<AccessFilter filter={filter}>
			<SidebarMenuItem>
				<SidebarMenuButton asChild isActive={isActive} className={className} tooltip={{ children: label }}>
					<LocalLink href={link} prefetch={true}>
						{icon}
						{label}
						{badge}
					</LocalLink>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</AccessFilter>
	);
}

function NavGroupMultipleItemList({
	item: { label, items, badge, icon },
	activeLink,
}: {
	item: NavGroupMultipleItem;
	activeLink?: string | null;
}) {
	const { state, setOpen } = useSidebar();
	const isAnyChildActive = useMemo(() => items.some((subItem) => subItem.link === activeLink), [items, activeLink]);

	const [isOpen, setIsOpen] = useState(isAnyChildActive);

	useEffect(() => {
		if (isAnyChildActive) {
			setTimeout(() => setIsOpen(true), 0);
		}
	}, [isAnyChildActive]);

	return (
		<AccessFilter filter={items.some((i) => i.filter === undefined) ? undefined : { any: items.map((i) => i.filter) }}>
			<Collapsible asChild open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							isActive={false}
							tooltip={{ children: label }}
							onClick={() => {
								if (state === 'collapsed') {
									setOpen(true);
									setIsOpen(true);
								}
							}}
						>
							{icon}
							{label}
							<div className="ml-auto inline-flex items-center gap-2">
								<span className="text-xs">{badge}</span>
								<ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</div>
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{items?.map((subItem) => {
								const isActive = activeLink === subItem.link;
								return (
									<AccessFilter key={subItem.link} filter={subItem.filter}>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild isActive={isActive} className={subItem.className}>
												<LocalLink href={subItem.link} prefetch={true}>
													{subItem.icon}
													{subItem.label}
													{subItem.badge}
												</LocalLink>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</AccessFilter>
								);
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		</AccessFilter>
	);
}

function AccessFilter(props: React.ComponentProps<typeof ClientProtectedElement>) {
	if (props.filter) {
		return <ClientProtectedElement {...props} />;
	}

	return props.children;
}

function UserBanner() {
	return (
		<ClientProtectedElement
			filter
			loading={<Skeleton className="h-12 w-full" />}
			alt={
				<div className="flex h-12 w-full items-center px-1">
					<LoginButton className="w-full" />
				</div>
			}
		>
			<CurrentUserComponent>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<UserWithAvatarAndNameAndRole />
									<EllipsisVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
								side="top"
								align="start"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<UserWithAvatarAndNameAndRole />
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<LocalLink href={routes.me.value}>
										<DropdownMenuItem>
											<UserCircle />
											<Tran text="account" />
										</DropdownMenuItem>
									</LocalLink>
									<LocalLink href={routes.notification}>
										<DropdownMenuItem>
											<Bell />
											<Tran text="notifications" />
										</DropdownMenuItem>
									</LocalLink>
									<DropdownMenuItem asChild>
										<LocalLink href={routes.settings}>
											<Settings />
											<Tran text="settings" />
										</LocalLink>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href={`${environment.url.apiV4}/auth/logout`}>
										<LogOut />
										<Tran text="logout" />
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</CurrentUserComponent>
		</ClientProtectedElement>
	);
}
