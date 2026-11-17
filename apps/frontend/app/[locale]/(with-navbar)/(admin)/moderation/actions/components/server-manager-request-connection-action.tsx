'use client';
import { Tran } from '@/i18n/tran';

export default function ServerManagerRequestConnectionAction() {
	return (
		<div className="space-y-1">
			<span className="font-medium"><Tran text="moderation.requested-connection" /></span>
		</div>
	);
}
