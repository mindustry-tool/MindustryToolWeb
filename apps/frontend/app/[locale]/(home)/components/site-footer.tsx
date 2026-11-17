import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';
import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import { WebName } from '@/components/common/web-name';

export default function SiteFooter() {
	return (
		<footer className="bg-black py-12 text-sm text-gray-400">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
					<div className="col-span-2 lg:col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<MindustryToolIcon className="h-8 w-8" />
							<WebName />
						</div>
						<p className="max-w-xs text-gray-500">
							<Tran
								text="footer.description"
							/>
						</p>
					</div>

					<div>
						<h3 className="mb-4 font-semibold text-white">
							<Tran text="footer.platform" />
						</h3>
						<ul className="space-y-3">
							<li>
								<LocalLink href={routes.home} className="hover:text-primary transition-colors">
									<Tran text="common.home" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.about} className="hover:text-primary transition-colors">
									<Tran text="common.about" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.tools.value} className="hover:text-primary transition-colors">
									<Tran text="common.tools" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.servers.value} className="hover:text-primary transition-colors">
									<Tran text="common.servers" />
								</LocalLink>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 font-semibold text-white">
							<Tran text="footer.database" />
						</h3>
						<ul className="space-y-3">
							<li>
								<LocalLink href={routes.database.schematics.value} className="hover:text-primary transition-colors">
									<Tran text="common.schematics" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.database.maps.value} className="hover:text-primary transition-colors">
									<Tran text="common.maps" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.posts.value} className="hover:text-primary transition-colors">
									<Tran text="common.posts" />
								</LocalLink>
							</li>
							<li>
								<LocalLink href={routes.wiki.value} className="hover:text-primary transition-colors">
									<Tran text="common.wiki" />
								</LocalLink>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 font-semibold text-white">
							<Tran text="footer.community" />
						</h3>
						<ul className="space-y-3">
							<li>
								<LocalLink href={routes.donate} className="hover:text-primary transition-colors">
									<Tran text="donate.nav" />
								</LocalLink>
							</li>
							<li>
								<a
									href={environment.url.discordServer}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary transition-colors"
								>
									Discord
								</a>
							</li>
							<li>
								<a
									href={environment.url.github}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary transition-colors"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-gray-500">
						&copy; {new Date().getFullYear()} Mindustry Tool.{' '}
						<Tran text="footer.rights" />
					</p>
					<div className="flex gap-6">
						<a
							href="https://mindustry-tool.com/wiki/019b1314-9fdd-738e-9184-1f822562ac68?path=mindustrytool.privacy-policy"
							className="hover:text-white transition-colors"
						>
							<Tran text="footer.privacy" />
						</a>
						<a
							href="https://mindustry-tool.com/wiki/019b1319-501c-7626-a5c6-91cf16e5a8dd?path=mindustrytool.terms-of-service"
							className="hover:text-white transition-colors"
						>
							<Tran text="footer.terms" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
