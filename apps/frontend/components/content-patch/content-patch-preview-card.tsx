import { ContentPatchDto } from '@mindustry-tool/api';
import { ReactNode } from 'react';

export function ContentPatchPreviewCard({ data, children }: { data: ContentPatchDto; children: ReactNode }) {
	const { name, description } = data;
	return (
		<div className="border rounded-md p-2 bg-card flex flex-col gap-1 shadow-lg">
			<span className="text-xl font-semibold">{name}</span>
			<p className="text-muted-foreground">{description}</p>
			<div className="grid auto-cols-auto grid-flow-col gap-2 mt-auto pt-2">{children}</div>
		</div>
	);
}
