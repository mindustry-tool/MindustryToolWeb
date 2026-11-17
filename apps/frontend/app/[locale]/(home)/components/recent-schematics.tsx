'use client';

import { SchematicDto } from '@mindustry-tool/api';
import { SchematicPreviewCard } from '@/components/schematic/schematic-preview-card';
import { LikeButton } from '@/components/buttons/like-button';
import { CommentButton } from '@/components/common/preview';
import { DownloadButton } from '@/components/buttons/download-button';
import { SchematicCopyButton } from '@/components/schematic/schematic-copy-button';
import { LocalLink } from '@/components/common/locale-link';
import { routes } from '@/config/routes';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import FadeInWhenVisible from './fade-in-when-visible';
import InfiniteCarousel from './infinite-carousel';

const SCHEMATICS_QUERY_KEY = ['schematics'];

interface RecentSchematicsProps {
	data: SchematicDto[];
}

export default function RecentSchematics({ data }: RecentSchematicsProps) {
	if (!data || data.length === 0) {
		return null;
	}

	return (
		<section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
			<FadeInWhenVisible>
				<div className="mb-8 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white sm:text-3xl">
						<Tran text="home.recent-schematics" />
					</h2>
					<Button variant="ghost" asChild className="hover:bg-green-400/10 hover:text-green-300">
						<LocalLink href={routes.database.schematics.value}>
							<Tran text="common.view-all" />
							<ArrowRight className="ml-2 h-4 w-4" />
						</LocalLink>
					</Button>
				</div>

				<InfiniteCarousel speed={40} direction="left">
					{data.map((item) => (
						<div key={item.id} className="w-75 shrink-0">
							<SchematicPreviewCard data={item}>
								<LikeButton itemType="schematics" data={item} variant="outline" />
								<CommentButton itemType="schematics" data={item} />
								<DownloadButton itemType="schematics" queryKey={SCHEMATICS_QUERY_KEY} data={item} />
								<SchematicCopyButton data={item} />
							</SchematicPreviewCard>
						</div>
					))}
				</InfiniteCarousel>
			</FadeInWhenVisible>
		</section>
	);
}
