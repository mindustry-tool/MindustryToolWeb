import type { I18nConfig } from 'next-i18next/proxy';
import { DEfAULT_I18N_NAMESPACE, DEfAULT_LOCALE, LOCALES } from '@mindustry-tool/api';

const i18nConfig: I18nConfig = {
	supportedLngs: [...LOCALES],
	fallbackLng: DEfAULT_LOCALE,
	defaultNS: DEfAULT_I18N_NAMESPACE,
	ns: [
		'about',
		'common',
		'tags',
		'comment',
		'logic',
		'generator-canvas',
		'wiki',
		'home',
		'footer',
		'donate',
		'server',
		'tools',
		'meta',
		'schematic',
		'login',
		'generator-logic-display',
		'generator-sorter',
		'translation',
		'moderation',
		'player-connect',
		'upload',
		'map',
		'mod',
		'file',
		'post',
		'editor',
		'image',
		'generator-logic-disply',
		'chat',
		'content-patch',
		'setting',
		'sitemap',
		'icon',
		'tag',
		'like',
		'search-bar',
		'user',
		'notification',
	],
	i18nextOptions: {
		preload: false,
	},
	resourceLoader: async (lng, ns) => {
		if (!lng || typeof lng !== 'string' || !(LOCALES as readonly string[]).includes(lng)) {
			return {};
		}
		const mod = await import(`./app/i18n/locales/${lng}/${ns}.json`);
		return mod.default || mod;
	},
};

export default i18nConfig;
