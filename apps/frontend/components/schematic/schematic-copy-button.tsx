'use client';

import { Copy } from 'lucide-react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';
import { useCallback } from 'react';
import { apiInstance } from '@/config/api';
import { api } from '@mindustry-tool/api';

const copy = async (id: string) => {
	try {
		const buffer = await apiInstance.request(api.v4.schematics.data, {
			params: {
				id,
			},
			responseType: 'buffer',
		});

		const bytes = new Uint8Array(buffer);

		let binary = '';
		const chunkSize = 0x8000;

		for (let i = 0; i < bytes.length; i += chunkSize) {
			binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
		}

		const base64 = btoa(binary);
		navigator.clipboard.writeText(base64).then(
			() => {
				toast.success(<Tran text="copied" />);
			},
			(error) => {
				toast.error(<Tran text="error" />, {
					description: error.message,
				});
			},
		);
	} catch (error) {
		toast.error(<Tran text="error" />, {
			description: String(error),
		});
		return;
	}
};

export function SchematicCopyButton({
	data: { itemId },
	...props
}: React.ComponentProps<typeof Button> & { data: { itemId: string } }) {
	const { t } = useI18n();
	const handleClick = useCallback(() => copy(itemId), [itemId]);

	return (
		<Button variant="outline" aria-label={t('copy')} {...props} onClick={handleClick}>
			<Copy />
		</Button>
	);
}
