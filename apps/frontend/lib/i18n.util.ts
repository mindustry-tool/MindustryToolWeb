import type { Locale } from '@mindustry-tool/api';
import { LOCALES } from '@mindustry-tool/api';
import environment from '@/config/environment';

const hrefLangs: Record<Locale, string> = {
	en: 'en',
	kr: 'ko',
	cn: 'zh',
	jp: 'ja',
	ru: 'ru',
	ua: 'uk-UA',
	vi: 'vi',
	fr: 'fr',
	de: 'de',
	id: 'id',
	be: 'be',
};

export function generateAlternate(path: string) {
	return {
		canonical: './',
		languages: Object.fromEntries(
			LOCALES.map((lang) => [hrefLangs[lang], environment.url.base + `/${lang}/${path}`.replaceAll('//', '/')]),
		),
	};
}
