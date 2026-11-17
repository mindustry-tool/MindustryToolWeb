import type { Metadata } from 'next';
import {
	BookOpen,
	ClipboardList,
	Code2,
	Cpu,
	ExternalLink,
	Github,
	Heart,
	Layers,
	Map,
	Server,
	Sparkles,
	Users,
	Wrench,
} from 'lucide-react';

import ScrollContainer from '@/components/common/scroll-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import DiscordIcon from '@/components/icons/discord-icon';
import { LocalLink } from '@/components/common/locale-link';
import environment from '@/config/environment';
import { routes } from '@/config/routes';
import { getTranslation } from '@/i18n/i18n.server';
import { Tran } from '@/i18n/tran';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
	const { locale } = await params;

	const { t } = await getTranslation(locale, ['about', 'common', 'meta']);

	const title = t('about', { defaultValue: 'About' });
	const description = t('about-description', {
		defaultValue:
			'MindustryTool is an all-in-one platform for the Mindustry community, providing tools and resources to make creating, managing, and sharing Mindustry content easier. It includes features such as schematic sharing, modding tools, project editors, server management, maps, and other utilities designed for both players and developers.',
	});

	return {
		title: formatTitle(title),
		description,
		openGraph: {
			title: formatTitle(title),
			description,
			images: ['/assets/images/mindustry-tool.png'],
		},
		alternates: generateAlternate('/about'),
	};
}

const features = [
	{
		titleKey: 'about.feature-schematic-sharing',
		descriptionKey: 'about.feature-schematic-sharing-desc',
		icon: ClipboardList,
		href: routes.database.schematics.value,
		badgeKey: 'about.badge-database',
	},
	{
		titleKey: 'about.feature-modding-tools',
		descriptionKey: 'about.feature-modding-tools-desc',
		icon: Code2,
		href: routes.tools.modEditor,
		isExternal: true,
		badgeKey: 'about.badge-tools',
	},
	{
		titleKey: 'about.feature-server-management',
		descriptionKey: 'about.feature-server-management-desc',
		icon: Server,
		href: routes.servers.value,
		badgeKey: 'about.badge-multiplayer',
	},
	{
		titleKey: 'about.feature-maps-content',
		descriptionKey: 'about.feature-maps-content-desc',
		icon: Map,
		href: routes.database.maps.value,
		badgeKey: 'about.badge-database',
	},
	{
		titleKey: 'about.feature-utilities-generators',
		descriptionKey: 'about.feature-utilities-generators-desc',
		icon: Cpu,
		href: routes.tools.value,
		badgeKey: 'about.badge-utilities',
	},
	{
		titleKey: 'about.feature-wiki-docs',
		descriptionKey: 'about.feature-wiki-docs-desc',
		icon: BookOpen,
		href: routes.wiki.value,
		badgeKey: 'about.badge-resources',
	},
] as const;

export default function Page() {
	return (
		<ScrollContainer className="p-4 sm:p-6 lg:p-8">
			<div className="mx-auto w-full max-w-5xl space-y-10 pb-12">
				{/* Hero / Header */}
				<div className="space-y-6">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline" className="gap-1.5 border-primary/40 bg-primary/5 text-primary">
							<Sparkles className="size-3.5" />
							<span><Tran text="about.all-in-one-platform" /></span>
						</Badge>
						<Badge variant="secondary" className="text-xs">
							<Tran text="about.mindustry-community" />
						</Badge>
					</div>

					<div className="flex items-center gap-4">
						<div className="relative shrink-0">
							<div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-sm" />
							<MindustryToolIcon width={56} height={56} className="relative rounded-xl border border-border/80 shadow-md" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
							<Tran text="about.title" />
						</h1>
						<p className="text-sm text-muted-foreground sm:text-base">
							<Tran text="about.subtitle" />
						</p>
						</div>
					</div>

					{/* Primary Statement */}
					<div className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-xs sm:p-6">
						<p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
							<Tran
								text="about.description"
							/>
						</p>

						<div className="mt-6 flex flex-wrap items-center gap-3">
							<Button asChild size="sm">
								<LocalLink href={routes.database.schematics.value}>
									<ClipboardList className="size-4" />
									<span><Tran text="about.explore-schematics" /></span>
								</LocalLink>
							</Button>
							<Button asChild variant="outline" size="sm">
								<LocalLink href={routes.tools.value}>
									<Wrench className="size-4" />
									<span><Tran text="about.all-tools" /></span>
								</LocalLink>
							</Button>
							<Button asChild variant="outline" size="sm">
								<LocalLink href={routes.servers.value}>
									<Layers className="size-4" />
									<span><Tran text="about.servers" /></span>
								</LocalLink>
							</Button>
							<Button asChild variant="ghost" size="sm">
								<a href={environment.url.discordServer} target="_blank" rel="noopener noreferrer">
									<DiscordIcon />
									<span><Tran text="about.discord" /></span>
								</a>
							</Button>
						</div>
					</div>
				</div>

				{/* Key Features */}
				<section className="space-y-4">
					<div>
						<h2 className="text-xl font-bold tracking-tight text-foreground"><Tran text="about.platform-features" /></h2>
						<p className="text-sm text-muted-foreground">
							<Tran text="about.platform-features-desc" />
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => {
							const Icon = feature.icon;
							const isExt = 'isExternal' in feature && feature.isExternal;
							return (
								<Card
									key={feature.titleKey}
									className="group flex flex-col justify-between border-border/60 bg-card/50 transition-colors hover:border-border hover:bg-card"
								>
									<CardHeader className="space-y-2 pb-3">
										<div className="flex items-center justify-between gap-2">
											<div className="flex size-9 items-center justify-center rounded-lg border bg-muted/60 text-primary">
												<Icon className="size-4" />
											</div>
											<Badge variant="secondary" className="text-xs font-normal">
												<Tran text={feature.badgeKey} />
											</Badge>
										</div>
										<CardTitle className="text-base font-semibold"><Tran text={feature.titleKey} /></CardTitle>
										<CardDescription className="text-xs leading-relaxed">
											<Tran text={feature.descriptionKey} />
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										{isExt ? (
											<a
												href={feature.href}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
											>
												<span><Tran text="about.open-tool" /></span>
												<ExternalLink className="size-3" />
											</a>
										) : (
											<LocalLink
												href={feature.href}
												className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
											>
												<span><Tran text="about.explore" /></span>
												<ExternalLink className="size-3" />
											</LocalLink>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</section>

				{/* For Players & For Developers */}
				<section className="space-y-4">
					<div>
						<h2 className="text-xl font-bold tracking-tight text-foreground"><Tran text="about.designed-for-everyone" /></h2>
						<p className="text-sm text-muted-foreground">
							<Tran text="about.designed-for-everyone-desc" />
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Players */}
						<Card className="border-border/60 bg-card/50">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<Users className="size-4 text-primary" />
									<span><Tran text="about.for-players" /></span>
								</CardTitle>
								<CardDescription className="text-xs">
									<Tran text="about.for-players-desc" />
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-xs text-muted-foreground">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-players-1" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-players-2" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-players-3" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-players-4" /></span>
									</li>
								</ul>
							</CardContent>
						</Card>

						{/* Developers */}
						<Card className="border-border/60 bg-card/50">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<Code2 className="size-4 text-primary" />
									<span><Tran text="about.for-developers" /></span>
								</CardTitle>
								<CardDescription className="text-xs">
									<Tran text="about.for-developers-desc" />
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-xs text-muted-foreground">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-developers-1" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-developers-2" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-developers-3" /></span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										<span><Tran text="about.for-developers-4" /></span>
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Community & Support */}
				<section className="rounded-xl border border-border/60 bg-muted/20 p-5 sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<h3 className="text-base font-semibold text-foreground"><Tran text="about.join-community" /></h3>
							<p className="text-xs text-muted-foreground sm:text-sm">
								<Tran text="about.join-community-desc" />
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
								<Button asChild variant="outline" size="sm">
								<a href={environment.url.discordServer} target="_blank" rel="noopener noreferrer">
									<DiscordIcon />
									<span><Tran text="about.discord" /></span>
								</a>
							</Button>
							<Button asChild variant="outline" size="sm">
								<a href={environment.url.github} target="_blank" rel="noopener noreferrer">
									<Github className="size-4" />
									<span><Tran text="about.github" /></span>
								</a>
							</Button>
							<Button asChild size="sm">
								<LocalLink href={routes.donate}>
									<Heart className="size-4 text-rose-400" />
									<span><Tran text="about.donate" /></span>
								</LocalLink>
							</Button>
						</div>
					</div>
				</section>
			</div>
		</ScrollContainer>
	);
}
