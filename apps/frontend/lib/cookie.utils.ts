import { MID_COOKIE_NAME } from '@/config/environment';

export { MID_COOKIE_NAME };

const MID_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export interface MidCookieOptions {
	path: string;
	domain?: string;
	maxAge: number;
	sameSite: 'lax';
}

export interface EnsureMidCookieParams {
	existingMid?: string;
	documentCookie?: string;
	userAgent?: string | null;
	hostname?: string;
	setCookie: (name: 'mid', value: string, options: MidCookieOptions) => void;
	hasMidCookie?: () => boolean;
	isBot?: (userAgent?: string | null) => Promise<boolean>;
	isCancelled?: () => boolean;
}

/**
 * Dynamically loads `isbot` and checks whether the given user agent belongs to a bot or crawler.
 */
export async function isBotUserAgent(userAgent?: string | null): Promise<boolean> {
	if (!userAgent) {
		return false;
	}

	const { isbot } = await import('isbot');
	return isbot(userAgent);
}

function generateWebMid(): string {
	const randomId =
		typeof crypto !== 'undefined' && crypto.randomUUID
			? crypto.randomUUID()
			: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	return `web:${randomId}`;
}

/**
 * Ensures non-bot visitors receive a `web:`-prefixed `mid` cookie while skipping bot/crawler user agents.
 */
export async function ensureMidCookie({
	existingMid,
	documentCookie,
	userAgent,
	hostname,
	setCookie,
	hasMidCookie,
	isBot = isBotUserAgent,
	isCancelled,
}: EnsureMidCookieParams): Promise<void> {
	const existingCookie =
		existingMid || documentCookie?.match(new RegExp(`(?:^|;\\s*)${MID_COOKIE_NAME}=([^;]+)`))?.[1];

	if (existingCookie?.startsWith('web:')) {
		return;
	}

	let bot = false;
	try {
		bot = await isBot(userAgent);
	} catch {
		bot = false;
	}

	if (bot || isCancelled?.()) {
		return;
	}

	const id = generateWebMid();
	const cookieDomain = getCookieDomain(hostname);

	const writeMidCookie = (domain?: string) => {
		setCookie(MID_COOKIE_NAME, id, {
			path: '/',
			...(domain ? { domain } : {}),
			maxAge: MID_COOKIE_MAX_AGE_SECONDS,
			sameSite: 'lax',
		});
	};

	writeMidCookie(cookieDomain);

	if (cookieDomain && hasMidCookie && !hasMidCookie()) {
		writeMidCookie(undefined);
	}
}

export function getCookieDomain(hostname?: string): string | undefined {
	if (process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
		return process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
	}
	if (process.env.NEXT_PUBLIC_DOMAIN) {
		return process.env.NEXT_PUBLIC_DOMAIN;
	}

	if (typeof window === 'undefined' && !hostname) {
		return undefined;
	}

	const host = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
	if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
		return undefined;
	}

	const parts = host.split('.');
	if (parts.length >= 3 && /(?:co|com|org|net|edu|gov)\.[a-z]{2}$/i.test(host)) {
		return `.${parts.slice(-3).join('.')}`;
	}
	if (parts.length >= 2) {
		return `.${parts.slice(-2).join('.')}`;
	}
	return undefined;
}
