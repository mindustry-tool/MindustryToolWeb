import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslation } from '@/i18n/i18n.server';
import { generateAlternate } from '@/lib/i18n.util';
import { formatTitle } from '@/lib/string.utils';
import { PageClient } from './page.client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale, ['server', 'common', 'meta']);
  const title = t('community-servers');
  const description = t('community-servers-description');

  return {
    title: formatTitle(title),
    description,
    openGraph: {
      title: formatTitle(title),
      description,
    },
    alternates: generateAlternate('/community-servers'),
  };
}

export default function CommunityServersPage() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
