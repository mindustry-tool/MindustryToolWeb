'use client';

import type { ServerDto } from '@mindustry-tool/api';
import { ClipboardIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tran } from '@/i18n/tran';

export function AddressButton({ server }: { server: ServerDto }) {
	const { port } = server;
	const address = server.address.replace('http://', '').replace('https://', '');

	return (
		<button
            className='p-0 text-sm cursor-pointer text-foreground'
			onClick={() => {
				navigator.clipboard
					.writeText(`${address}:${port}`)
					.then(() => {
						toast.info(<Tran text="copied" />, {
							description: `${address}:${port}`,
						});
					})
					.catch((error) => {
						toast.error(String(error));
					});
			}}
		>
			<span className="flex items-center gap-1 font-semibold underline">
				<ClipboardIcon className='size-4'/>
				<span>{`${address}:${port}`}</span>
			</span>
		</button>
	);
}
