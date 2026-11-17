import Link from 'next/link';
import DiscordIcon from '@/components/icons/discord-icon';
import { Button } from '@/components/ui/button';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';
import { PageWrapper } from '@/components/common/page-wrapper';

export default function Page() {
	return (
		<PageWrapper>
			<Button asChild>
				<Link href={environment.url.vnDiscordServer}>
					<DiscordIcon />
					<Tran text="discord" />
				</Link>
			</Button>
		</PageWrapper>
	);
}
