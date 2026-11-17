import { describe, expect, it, vi } from 'vitest';
import { ensureMidCookie, getCookieDomain, isBotUserAgent, MID_COOKIE_NAME } from './cookie.utils';

const HUMAN_CHROME_UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HUMAN_MOBILE_SAFARI_UA =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const BOT_USER_AGENTS = [
	['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
	[
		'Googlebot Smartphone',
		'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
	],
	['Bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
	['GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'],
	['Discordbot', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'],
] as const;

describe('getCookieDomain', () => {
	it('returns undefined for localhost', () => {
		expect(getCookieDomain('localhost')).toBeUndefined();
	});

	it('returns undefined for IPv4 addresses', () => {
		expect(getCookieDomain('127.0.0.1')).toBeUndefined();
		expect(getCookieDomain('192.168.1.10')).toBeUndefined();
	});

	it('returns undefined for IPv6 or host with port/colons', () => {
		expect(getCookieDomain('::1')).toBeUndefined();
		expect(getCookieDomain('localhost:3000')).toBeUndefined();
	});

	it('returns undefined for single-part hostnames', () => {
		expect(getCookieDomain('mycomputer')).toBeUndefined();
	});

	it('returns base domain with leading dot for standard domain', () => {
		expect(getCookieDomain('mindustry-tool.com')).toBe('.mindustry-tool.com');
	});

	it('returns base domain with leading dot for subdomains', () => {
		expect(getCookieDomain('api.mindustry-tool.com')).toBe('.mindustry-tool.com');
		expect(getCookieDomain('dev.api.mindustry-tool.com')).toBe('.mindustry-tool.com');
		expect(getCookieDomain('www.mindustry-tool.com')).toBe('.mindustry-tool.com');
	});

	it('handles two-part country code TLDs', () => {
		expect(getCookieDomain('mindustry.co.uk')).toBe('.mindustry.co.uk');
		expect(getCookieDomain('sub.mindustry.co.uk')).toBe('.mindustry.co.uk');
		expect(getCookieDomain('mindustry.com.vn')).toBe('.mindustry.com.vn');
	});
});

describe('isBotUserAgent', () => {
	it('returns false when userAgent is missing or empty', async () => {
		await expect(isBotUserAgent(undefined)).resolves.toBe(false);
		await expect(isBotUserAgent(null)).resolves.toBe(false);
		await expect(isBotUserAgent('')).resolves.toBe(false);
	});

	it('returns false for standard human browser user agents', async () => {
		await expect(isBotUserAgent(HUMAN_CHROME_UA)).resolves.toBe(false);
		await expect(isBotUserAgent(HUMAN_MOBILE_SAFARI_UA)).resolves.toBe(false);
	});

	it.each(BOT_USER_AGENTS)('returns true for %s', async (_name, ua) => {
		await expect(isBotUserAgent(ua)).resolves.toBe(true);
	});
});

describe('ensureMidCookie', () => {
	it('retains existing web-prefixed mid cookie without invoking bot check', async () => {
		const setCookie = vi.fn();
		const isBot = vi.fn().mockResolvedValue(false);

		await ensureMidCookie({
			existingMid: 'web:existing-123',
			userAgent: HUMAN_CHROME_UA,
			setCookie,
			isBot,
		});

		expect(isBot).not.toHaveBeenCalled();
		expect(setCookie).not.toHaveBeenCalled();
	});

	it('retains web-prefixed mid cookie found in documentCookie without invoking bot check', async () => {
		const setCookie = vi.fn();
		const isBot = vi.fn().mockResolvedValue(false);

		await ensureMidCookie({
			documentCookie: `foo=bar; ${MID_COOKIE_NAME}=web:from-doc-cookie`,
			userAgent: HUMAN_CHROME_UA,
			setCookie,
			isBot,
		});

		expect(isBot).not.toHaveBeenCalled();
		expect(setCookie).not.toHaveBeenCalled();
	});

	it.each(BOT_USER_AGENTS)('does not set mid cookie for %s', async (_name, ua) => {
		const setCookie = vi.fn();

		await ensureMidCookie({
			userAgent: ua,
			hostname: 'mindustry-tool.com',
			setCookie,
		});

		expect(setCookie).not.toHaveBeenCalled();
	});

	it('sets a web-prefixed mid cookie for a human browser', async () => {
		const setCookie = vi.fn();

		await ensureMidCookie({
			userAgent: HUMAN_CHROME_UA,
			hostname: 'mindustry-tool.com',
			setCookie,
			hasMidCookie: () => true,
		});

		expect(setCookie).toHaveBeenCalledTimes(1);
		const [name, value, options] = setCookie.mock.calls[0] ?? [];
		expect(name).toBe(MID_COOKIE_NAME);
		expect(value).toMatch(/^web:.+/);
		expect(options).toEqual({
			path: '/',
			domain: '.mindustry-tool.com',
			maxAge: 365 * 24 * 60 * 60,
			sameSite: 'lax',
		});
	});

	it('falls back to host-only cookie when domain cookie fails to persist', async () => {
		const setCookie = vi.fn();

		await ensureMidCookie({
			userAgent: HUMAN_CHROME_UA,
			hostname: 'mindustry-tool.com',
			setCookie,
			hasMidCookie: () => false,
		});

		expect(setCookie).toHaveBeenCalledTimes(2);
		expect(setCookie.mock.calls[0]?.[2]).toMatchObject({ domain: '.mindustry-tool.com' });
		expect(setCookie.mock.calls[1]?.[2]).not.toHaveProperty('domain');
	});

	it('replaces non-web mid cookie for human browser but skips for bots', async () => {
		const setCookieHuman = vi.fn();
		await ensureMidCookie({
			existingMid: 'legacy-id',
			userAgent: HUMAN_CHROME_UA,
			setCookie: setCookieHuman,
		});
		expect(setCookieHuman).toHaveBeenCalledTimes(1);

		const setCookieBot = vi.fn();
		await ensureMidCookie({
			existingMid: 'legacy-id',
			userAgent: BOT_USER_AGENTS[0][1],
			setCookie: setCookieBot,
		});
		expect(setCookieBot).not.toHaveBeenCalled();
	});

	it('does not set cookie if cancelled before bot check resolves', async () => {
		const setCookie = vi.fn();

		await ensureMidCookie({
			userAgent: HUMAN_CHROME_UA,
			setCookie,
			isBot: async () => false,
			isCancelled: () => true,
		});

		expect(setCookie).not.toHaveBeenCalled();
	});
});
