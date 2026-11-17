import { api } from '@mindustry-tool/api';

import { Smile } from 'lucide-react';
import Image from 'next/image';
import { InfiniteApiItem } from '@/components/query/infinite-api-item';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

const ICONS_QUERY_KEY = ['icons'];

export function IconPopover() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon">
					<Smile />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="max-h-[80dvh] lg:max-h-[50vh]">
				<IconPopoverContent />
			</PopoverContent>
		</Popover>
	);
}

function IconPopoverContent() {
	const { editor } = useTiptapEditor();

	return (
		<InfiniteApiItem
			className="space-y-1"
			queryKey={ICONS_QUERY_KEY}
			route={api.v4.icon.get}
			query={{
				page: 0,
				size: 50,
			}}
		>
			{(pages) =>
				Object.entries(
					Object.groupBy(
						pages.flatMap((page) => page),
						(item) => item.group?.name || '',
					),
				).map(([name, items]) => (
					<div key={name}>
						<span>{name}</span>
						<div className="grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))]">
							{items?.map((item) => (
								<Image
									key={item.id}
									className="size-8 rounded-md object-cover object-center"
									src={item.url}
									alt={item.id}
									width={32}
									height={32}
									onClick={() =>
										editor
											?.chain()
											.focus()
											.insertContent([
												{
													type: 'mention',
													attrs: { mentionSuggestionChar: ':', label: item.url, id: item.id },
												},
												{
													type: 'text',
													text: ' ',
												},
											])
											.run()
									}
								/>
							))}
						</div>
					</div>
				))
			}
		</InfiniteApiItem>
	);
}
