import type { PlanetDto } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';

import Image from 'next/image';

import { apiInstance } from '@/config/api';
import { cn } from '@/lib/utils';

type Props = {
	className?: string;
} & (
	| {
			type: 'single';
			value?: string | null;
			onValueSelected: (planet?: string) => void;
	  }
	| {
			type: 'multiple';
			value: string[];
			onValueSelected: (planets: string[]) => void;
	  }
);

export default function PlanetSelector({ className, type, value, onValueSelected }: Props) {
	const { data } = useQuery({
		queryKey: ['planets'],
		queryFn: () => apiInstance.request(api.v4.planets.findAll, {}),
	});

	const planets = data ?? [];

	return (
		<div className={cn('flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-wrap', className)}>
			{planets.map((planet) => (
				<PlanetCard
					key={planet.id}
					isSelected={type === 'single' ? value === planet.id : value.includes(planet.id)}
					planet={planet}
					onValueSelected={(selected) =>
						type === 'single'
							? onValueSelected(value === selected.id ? undefined : selected.id)
							: onValueSelected(
									value.includes(selected.id) ? value.filter((v) => v !== selected.id) : [...value, selected.id],
								)
					}
				/>
			))}
		</div>
	);
}

type PlanetCardProps = {
	planet: PlanetDto;
	isSelected: boolean;
	onValueSelected: (planet: PlanetDto) => void;
};

export function PlanetCard({ planet, isSelected, onValueSelected }: PlanetCardProps) {
	return (
		<button
			type="button"
			onClick={() => onValueSelected(planet)}
			className={cn(
				'inline-flex items-center gap-1.5 h-6.5 rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer transition-all duration-150 select-none shrink-0',
				isSelected
					? 'border-primary/60 bg-primary/20 text-primary-foreground font-semibold shadow-xs'
					: 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:border-border',
			)}
		>
			{planet.icon && (
				<Image
					className="size-3.5 shrink-0 object-contain rounded-full"
					key={planet.icon}
					width={16}
					height={16}
					src={planet.icon}
					loader={({ src }) => src}
					alt={planet.name}
				/>
			)}
			<span className="capitalize">{planet.name}</span>
		</button>
	);
}

