import { SendIcon } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';
import DiscordIcon from '@/components/icons/discord-icon';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';

const EXPLAIN_MESSAGE = `If you encountered an error, please let us know what happened. To help us fix it, describe:

What you were doing when the error occurred

The steps to reproduce the error (if possible)

Any error messages you saw

The more details you provide, the easier it is for us to solve the problem. Thank you!`;

// TODO: Error report

export default function ReportErrorForm() {
	const [message, setMessage] = useLocalStorage('error-message', '');
	// const { mutate, isPending } = useMutation({
	// 	mutationFn: () => {
	// 		const data = {
	// 			url: window.location.href,
	// 			message,
	// 			errors: errors.join('\n').slice(0, 10000),
	// 		};

	// 		return axios.post('/error-report', data, {
	// 			data,
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 		});
	// 	},
	// 	onSuccess: () => {
	// 		toast.success('Your report has been sent.');
	// 		setMessage('');
	// 	},
	// 	onError: () => toast.error('Something went wrong.'),
	// });

	return (
		<div className="flex flex-col gap-4 rounded-md border p-8">
			<DialogTitle>
				<Tran text="report-error" />
			</DialogTitle>
			<div className="flex flex-col gap-2">
				<AutosizeTextarea
					className="min-h-62.5 focus-visible:ring-0"
					value={message}
					placeholder={EXPLAIN_MESSAGE}
					minHeight={250}
					onChange={(event) => setMessage(event.currentTarget.value)}
				/>
				<Button variant="secondary" disabled={message.length === 0}>
					<SendIcon className="size-5" />
					<Tran text="send" />
				</Button>
			</div>
			<div className="flex h-1 w-full border-b" />
			<span>
				<Tran text="or-report-error-via-discord" />
			</span>
			<a
				className="flex h-9 items-center justify-center gap-1 rounded-md border border-border bg-[rgb(88,101,242)] px-4 py-2 font-semibold text-nowrap"
				href={environment.url.discordServer}
				target="_blank"
				rel="noopener noreferrer"
			>
				<DiscordIcon /> <Tran text="discord" />
			</a>
		</div>
	);
}
