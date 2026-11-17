'use client'

import { Locale } from '@mindustry-tool/api';
import { useParams } from 'next/navigation';

const localMap: Record<Locale, string> = {
	en: 'en-US',
	kr: 'ko-KR',
	cn: 'zh-CN',
	jp: 'ja-JP',
	ru: 'ru-RU',
	ua: 'ua-UA',
	vi: 'vi-VN',
	fr: 'fr-FR',
	de: 'de-DE',
	id: 'id-ID',
	be: 'be-BY',
};

export function LocaleDate({ date }: { date: Date }) {
	const { locale } = useParams<{ locale: Locale }>();

	const localeString = localMap[locale];

	return new Date(date).toLocaleString(localeString);
}
