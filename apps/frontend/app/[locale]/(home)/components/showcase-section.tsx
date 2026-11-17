import { Tran } from '@/i18n/tran';
import Image from 'next/image';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import FadeInWhenVisible from './fade-in-when-visible';

export default function ShowcaseSection() {
	return (
		<section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
			<FadeInWhenVisible>
				<h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
					<Tran text="home.showcase-title" />
				</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{/* Schematics */}
					<LocalLink
						href={routes.database.schematics.value}
						className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/50 hover:shadow-lg hover:-translate-y-2 duration-300"
					>
						<div className="p-4 text-white">
							<Tran text="home.showcase-schematics" />
						</div>
						<div className="relative aspect-video w-full">
							<Image
								src="/assets/images/schematic-page.png"
								alt="Schematics Showcase"
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
						</div>
					</LocalLink>
					{/* Tools */}
					<LocalLink
						href={routes.tools.value}
						className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:-translate-y-2 duration-300"
					>
						<div className="p-4 text-white">
							<Tran text="home.showcase-tools" />
						</div>
						<div className="relative aspect-video w-full">
							<Image
								src="/assets/images/tool-page.png"
								alt="Tools Showcase"
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
						</div>
					</LocalLink>
					{/* Server */}
					<LocalLink
						href={routes.servers.value}
						className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-2 duration-300"
					>
						<div className="p-4 text-white">
							<Tran text="home.showcase-server" />
						</div>
						<div className="relative aspect-video w-full">
							<Image
								src="/assets/images/server-page.png"
								alt="Server Showcase"
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
						</div>
					</LocalLink>
				</div>
			</FadeInWhenVisible>
		</section>
	);
}
