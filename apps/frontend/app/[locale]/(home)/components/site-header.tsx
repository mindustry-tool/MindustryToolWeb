import { MindustryToolIcon } from '@/components/common/mindustrytool-icon';
import { WebName } from '@/components/common/web-name';

export default function SiteHeader() {
	return (
		<header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-800/50 bg-black/80 px-4 py-2 backdrop-blur-md supports-backdrop-filter:bg-black/60 md:px-6 md:py-3">
			<div className="flex items-center gap-2 md:gap-3">
				<MindustryToolIcon />
				<WebName />
			</div>
		</header>
	);
}
