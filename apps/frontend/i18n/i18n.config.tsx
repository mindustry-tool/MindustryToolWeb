// Local static i18n configuration constants
import { DEfAULT_I18N_NAMESPACE, DEfAULT_LOCALE, LOCALES } from '@mindustry-tool/api';

export const i18nCommonOptions = {
	saveMissing: false,
	supportedLngs: LOCALES,
	fallbackLng: DEfAULT_LOCALE,
	fallbackNS: DEfAULT_I18N_NAMESPACE,
	defaultNS: DEfAULT_I18N_NAMESPACE,
	ns: DEfAULT_I18N_NAMESPACE,
	interpolation: {
		escapeValue: false,
	},
};
