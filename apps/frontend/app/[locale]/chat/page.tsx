'use client';

import { ChatPageProvider } from '@/app/[locale]/chat/components/chat-context';
import { ChatPageLayout } from '@/app/[locale]/chat/components/chat-layout';

export default function Page() {
	return (
		<ChatPageProvider>
			<ChatPageLayout />
		</ChatPageProvider>
	);
}
