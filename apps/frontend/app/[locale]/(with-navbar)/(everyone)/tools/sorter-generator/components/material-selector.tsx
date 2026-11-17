import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { Palette } from 'lucide-react';
import Image from 'next/image';
import type { MindustryMaterial } from '../lib/types';

type MaterialSelectorProps = {
	materials: MindustryMaterial[];
	selectedMaterials: string[];
	onSelectionChange: (selected: string[]) => void;
};

export function MaterialSelector({ materials, selectedMaterials, onSelectionChange }: MaterialSelectorProps) {
	const { t } = useI18n('tags');

	const toggleAll = (select: boolean) => {
		onSelectionChange(select ? materials.map((m) => m.name) : []);
	};

	const toggleMaterial = (materialName: string) => {
		if (selectedMaterials.includes(materialName)) {
			onSelectionChange(selectedMaterials.filter((m) => m !== materialName));
		} else {
			onSelectionChange([...selectedMaterials, materialName]);
		}
	};

	const allSelected = selectedMaterials.length === materials.length;
	const noneSelected = selectedMaterials.length === 0;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full">
					<Palette className="mr-2 h-4 w-4" />
					<Tran text="generator-sorter.select-materials" /> ({selectedMaterials.length}/
					{materials.length})
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						<Tran text="generator-sorter.select-materials" />
					</DialogTitle>
					<DialogDescription>
						<Tran
							text="generator-sorter.materials-description"
						/>{' '}
						({selectedMaterials.length}/{materials.length}{' '}
						<Tran text="generator-sorter.selected" />)
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => toggleAll(true)}
							disabled={allSelected}
							className="flex-1"
						>
							<Tran text="generator-sorter.select-all" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => toggleAll(false)}
							disabled={noneSelected}
							className="flex-1"
						>
							<Tran text="generator-sorter.deselect-all" />
						</Button>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
						{materials.map((material) => {
							const isSelected = selectedMaterials.includes(material.name);
							const displayName = t(`item-${material.name}`, { defaultValue: material.displayName });

							return (
								<div
									key={material.name}
									className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${isSelected ? 'bg-accent border-accent-foreground/20 hover:bg-accent/80' : 'hover:bg-muted/50'
										}`}
									onClick={() => toggleMaterial(material.name)}
								>
									<div
										className="h-4 w-4 rounded-sm border shrink-0"
										style={{ backgroundColor: material.color }}
									/>
									<div className="relative h-6 w-6 shrink-0">
										{material.imageUrl && <Image src={material.imageUrl} alt={displayName} fill className="object-contain" sizes="24px" />}
									</div>
									<label className="text-sm cursor-pointer flex-1 truncate">{displayName}</label>
								</div>
							);
						})}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
