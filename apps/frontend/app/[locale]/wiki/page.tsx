import { Tran } from '@/i18n/tran';

export default function Page() {
	return (
		<>
			<div className="mx-auto w-full max-w-[90ch] xl:w-[90ch]"><Tran text="wiki.home" /></div>
			<div className="mr-auto hidden h-full max-w-80 min-w-64 flex-col p-4 xl:flex"></div>
		</>
	);
}
