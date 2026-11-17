import { REDIRECT_COOKIE_NAME } from '@mindustry-tool/api';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RedirectPage() {
	const cookie = await cookies();

	const redirectUrl = cookie.get(REDIRECT_COOKIE_NAME);

	if (redirectUrl) {
		redirect(redirectUrl.value);
	} else {
		redirect('/');
	}
}
