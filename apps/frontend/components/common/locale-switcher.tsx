'use client';

import { FLAG_MAP, LOCALES } from '@mindustry-tool/api';
import ComboBox from '@/components/combo-box/combo-box';
import { useLocale } from '@/i18n/i18n.client';

const map = {
	en: 'English',
	vi: 'Tiếng Việt',
	kr: '한국어',
	cn: '中文',
	jp: '日本語',
	ru: 'Русский',
	ua: 'Українська',
	fr: 'Français',
	de: 'Deutsch',
	id: 'Bahasa Indonesia',
	be: 'Беларуская',
} as const;

export default function LocaleSwitcher() {
	const [locale, setLocale] = useLocale();

	return (
		<ComboBox
			required
			value={locale}
			values={LOCALES}
			onChange={(locale) => setLocale(locale)}
			render={(value) => (
				<span className="flex gap-1 capitalize">
					<span>{FLAG_MAP[value]}</span>
					<span>{map[value]}</span>
				</span>
			)}
		/>
	);
}
