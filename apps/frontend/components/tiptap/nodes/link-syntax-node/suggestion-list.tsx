import type { IconDto, UserDto } from '@mindustry-tool/api';
import type { ForwardedRef, KeyboardEvent } from 'react';
import Image from 'next/image';
import { useEffect, useImperativeHandle, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';

function useListSelect<T>({
	ref,
	onSelect,
	items,
}: {
	onSelect: (data: T) => void;
	items: T[];
	ref?: ForwardedRef<unknown>;
}) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const selectItem = (index: number) => {
		const item = items[index];

		if (item) {
			onSelect(item);
		}
	};

	const upHandler = () => {
		setSelectedIndex((selectedIndex + items.length - 1) % items.length);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	useEffect(() => setSelectedIndex(0), [items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }: { event: KeyboardEvent }) => {
			if (event.key === 'ArrowUp') {
				upHandler();
				return true;
			}

			if (event.key === 'ArrowDown') {
				downHandler();
				return true;
			}

			if (event.key === 'Enter') {
				enterHandler();
				return true;
			}

			return false;
		},
	}));

	return [selectedIndex, selectItem] as const;
}

export const MentionSuggestionList: React.FunctionComponent<{
	items: UserDto[];
	command: ({ label, id }: { label: string; id: string }) => void;
}> = ({
	ref,
	...props
}: { items: UserDto[]; command: ({ label, id }: { label: string; id: string }) => void } & {
	ref?: React.RefObject<unknown | null>;
}) => {
	const [selectedIndex, selectItem] = useListSelect({
		ref,
		onSelect: (item) => props.command({ label: item.name, id: item.id }),
		items: props.items,
	});

	return (
		<div className="flex flex-col gap-1 rounded-md border bg-card p-2">
			{props.items.length ? (
				props.items.map((item, index) => (
					<Button
						className="justify-start"
						variant={selectedIndex === index ? 'default' : 'ghost'}
						key={index}
						onClick={() => selectItem(index)}
					>
						{item.name}
					</Button>
				))
			) : (
				<div className="item"><Tran text="no-result" /></div>
			)}
		</div>
	);
};

MentionSuggestionList.displayName = 'MentionSuggestionList';

export const IconSuggestionList: React.FunctionComponent<{
	items: IconDto[];
	command: ({ label, id }: { label: string; id: string }) => void;
}> = ({
	ref,
	...props
}: { items: IconDto[]; command: ({ label, id }: { label: string; id: string }) => void } & {
	ref?: React.RefObject<unknown | null>;
}) => {
	const [selectedIndex, selectItem] = useListSelect({
		ref,
		onSelect: (item) => props.command({ label: item.url, id: item.id }),
		items: props.items,
	});

	return (
		<div className="flex flex-col gap-1 rounded-md border bg-card p-2">
			{props.items.length ? (
				props.items.map((item, index) => (
					<Button
						className="justify-start"
						variant={selectedIndex === index ? 'secondary' : 'ghost'}
						key={index}
						onClick={() => selectItem(index)}
					>
						<Image className="aspect-square size-6 object-cover" src={item.url} alt={item.id} width={24} height={24} />
						<span>:{item.id}:</span>
					</Button>
				))
			) : (
				<div className="item"><Tran text="no-result" /></div>
			)}
		</div>
	);
};

IconSuggestionList.displayName = 'IconSuggestionList';
