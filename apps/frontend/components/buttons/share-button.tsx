'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import environment from '@/config/environment';
import { useParams } from 'next/navigation';
import { api } from '@mindustry-tool/api';
import { LOCALES, SHARE_QUERY_NAME } from '@mindustry-tool/api';
import { useSession } from '@/hooks/use-session';
import { apiInstance } from '@/config/api';
import { useCallback } from 'react';
import { useI18n } from '@/i18n/i18n.client';

async function copy(url: string, locale: string, createShareLink: boolean) {
	let data = url;
	let toastId: string | number | undefined = undefined;

	if (data.startsWith('http')) {
		//
	} else {
		if (data.startsWith('/')) {
			data = data.slice(1);
		}

		if (!LOCALES.some((l) => data.startsWith(l))) {
			data = `${locale}/${data}`;
		}

		data = `${environment.url.base}/${data}`;
	}

	if (createShareLink) {
		try {
			toastId = toast.loading(<Tran text="generate-share-link" />);

			const uri = new URL(data);
			const share = await apiInstance.request(api.v4.share.create, {
				body: {
					url: data,
				},
			});
			uri.searchParams.append(SHARE_QUERY_NAME, share.id);

			data = uri.toString();
		} catch (error) {
			toast.error(<Tran text="error" />, {
				id: toastId,
				description: String(error),
			});
		}
	}

	navigator.clipboard
		.writeText(data)
		.then(() => {
			toast.info(<Tran text="copied" />, {
				id: toastId,
				description: data,
				descriptionClassName: 'text-ellipsis',
			});
		})
		.catch((error) =>
			toast.error(<Tran text="error" />, {
				id: toastId,
				description: error.message,
			}),
		);
}

export function ShareButton({
	className,
	url,
	...props
}: React.ComponentProps<typeof Button> & {
	url: string;
}) {
	const { locale } = useParams<{ locale: string }>();
	const { state } = useSession();
	const { t } = useI18n();
	const handleCopy = useCallback(() => {
		copy(url, locale, state === 'authenticated');
	}, [url, locale, state]);

	return (
		<Button
			className={cn(
				'backdrop-brightness-50 z-10 text-primary-foreground inline-flex md:hidden group-hover:inline-flex',
				className,
			)}
			variant="ghost"
			size="icon"
			aria-label={t('share')}
			{...props}
			onClick={handleCopy}
		>
			<Share2 />
		</Button>
	);
}
