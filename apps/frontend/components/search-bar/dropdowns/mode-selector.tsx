import type { ItemType } from '@mindustry-tool/api';
import type { Mode } from '@/components/search-bar/search-bar';
import { useMemo } from 'react';
import { DropdownCard } from '@/components/search-bar/dropdown-card';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';

type ModeSelectorProps = {
	type?: ItemType;
	author?: boolean;
	size?: boolean;
	setMode: (mode: Mode) => void;
};

export default function ModeSelector({ setMode, type, author, size }: ModeSelectorProps) {
	const modes = useMemo(() => {
		const value: {
			mode: Mode;
			label: Lowercase<string>;
			show: boolean;
		}[] = [
			{
				mode: 'name',
				label: 'search-bar.name',
				show: true,
			},
			{
				mode: 'tags',
				label: 'search-bar.tag',
				show: !!type,
			},
			{
				mode: 'author',
				label: 'search-bar.author',
				show: !!author,
			},
			{
				mode: 'width',
				label: 'search-bar.size',
				show: !!size,
			},
		];

		return value.filter(({ show }) => show);
	}, [type, author, size]);

	return (
		<DropdownCard>
			{modes.map(({ mode, label }) => (
				<Button
					key={mode}
					className="arrow-selector w-full justify-between hover:bg-primary hover:text-primary-foreground"
					size="sm"
					tabIndex={0}
					variant="command"
					onClick={() => setMode(mode)}
				>
					<Tran className="capitalize" text={label} />
				</Button>
			))}
		</DropdownCard>
	);
}
