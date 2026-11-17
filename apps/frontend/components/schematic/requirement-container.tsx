import type { SchematicDetailDto } from '@mindustry-tool/api';
import Image from 'next/image';

export function RequirementContainer({ requirements }: { requirements: SchematicDetailDto['meta']['requirements'] }) {
	return (
		<div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
			{requirements.map(({ name, amount, color }) => (
				<div
					key={name}
					className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs shadow-xs"
				>
					<Image
						className="size-3.5 shrink-0 object-contain"
						width={14}
						height={14}
						src={`https://content.mindustry-tool.com/api/v2/items/${name}/image.png`}
						alt={name}
					/>
					<span className="capitalize text-muted-foreground text-[11px]">{name.replace(/-/g, ' ')}</span>
					<span className="font-mono text-[11px] font-medium" style={{ color: color || undefined }}>
						{amount}
					</span>
				</div>
			))}
		</div>
	);
}
