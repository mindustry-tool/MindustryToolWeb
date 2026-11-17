'use client';

import { LocalLink } from '@/components/common/locale-link';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { Database, Wrench, ArrowRight, Heart } from 'lucide-react';
import { Tran } from '@/i18n/tran';
import FadeInWhenVisible from './fade-in-when-visible';
import TextTyping from '@/components/common/text-typing';
import { useI18n } from '@/i18n/i18n.client';

export default function HeroSection() {
	const { t } = useI18n('home');

	return (
		<div className="relative container mx-auto px-4 pt-10 sm:px-6 lg:px-8 lg:pt-20">
			<div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
				{/* Text Content */}
				<FadeInWhenVisible className="text-center lg:text-left">
					<h1 className="mb-6 text-3xl font-extrabold tracking-tight text-transparent bg-linear-to-r from-green-400 via-green-200 to-green-400 bg-clip-text sm:text-4xl md:text-5xl lg:text-6xl lg:mb-8">
						<Tran text="home.hero-title-leading" />
						<br className="hidden lg:block" />
						<span className="text-white">
							<Tran text="home.hero-title-trailing" />
						</span>
					</h1>

					<TextTyping
						as="p"
						className="mx-auto mb-8 max-w-2xl text-base text-gray-300 sm:text-lg md:mb-12 md:text-xl lg:mx-0 leading-relaxed min-h-20 lg:min-h-40"
						text={[
							t(
								'hero-sub',
								'No more searching for old schematics, manually editing logic, or struggling with map art. We bring you a suite of tools to store, design, and deploy every Mindustry idea in just a few clicks.',
							),
						]}
						typingSpeed={10}
						pauseDuration={1000}
						showCursor={true}
						cursorCharacter="|"
						loop={false}
					/>

					<div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
						<Button asChild size="lg">
							<LocalLink href={routes.database.schematics.value}>
								<Database className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
								<span className="relative z-10">
									<Tran text="home.cta-start" />
								</span>
							</LocalLink>
						</Button>

						<Button size="lg" variant="outline" className="group text-foreground" asChild>
							<LocalLink href={routes.tools.value}>
								<Wrench className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
								<Tran text="home.cta-tools" />
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</LocalLink>
						</Button>

						<Button
							size="lg"
							variant="outline"
							className="group border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 hover:border-rose-500/60"
							asChild
						>
							<LocalLink href={routes.donate}>
								<Heart className="mr-2 h-5 w-5 fill-rose-400 text-rose-400 transition-transform group-hover:scale-110" />
								<Tran text="home.cta-donate" />
							</LocalLink>
						</Button>
					</div>
				</FadeInWhenVisible>

				{/* Visual Element */}
				<FadeInWhenVisible delay={0.2} className="relative mx-auto w-full max-w-lg lg:max-w-none hidden sm:block">
					<div className="animate-float-hero relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl backdrop-blur-md lg:aspect-4/3">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-32 w-32 rounded-full bg-green-500/20 blur-3xl animate-pulse"></div>
							<div className="h-48 w-48 rounded-full bg-blue-500/20 blur-3xl -translate-x-10 translate-y-10 animate-pulse delay-700"></div>
						</div>

						{/* Abstract Cards */}
						<div className="animate-float-card-left absolute left-10 top-10 h-24 w-40 rounded-lg border border-white/10 bg-black/60 backdrop-blur-md p-4 shadow-lg">
							<div className="h-2 w-12 rounded bg-green-500/50 mb-2"></div>
							<div className="h-2 w-24 rounded bg-gray-700 mb-1"></div>
							<div className="h-2 w-20 rounded bg-gray-700"></div>
						</div>

						<div className="animate-float-card-right absolute right-10 bottom-20 h-32 w-32 rounded-lg border border-white/10 bg-black/60 backdrop-blur-md p-4 shadow-lg">
							<div className="grid grid-cols-2 gap-2 h-full">
								<div className="rounded bg-purple-500/20"></div>
								<div className="rounded bg-orange-500/20"></div>
								<div className="rounded bg-blue-500/20"></div>
								<div className="rounded bg-gray-500/20"></div>
							</div>
						</div>
					</div>
				</FadeInWhenVisible>
			</div>
		</div>
	);
}
