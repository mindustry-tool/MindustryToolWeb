import type { ItemTagDto } from '@mindustry-tool/api';
import type { ItemType } from '@mindustry-tool/api';
import { Check, Trash2 } from 'lucide-react';
import { Suspense, useState } from 'react';

import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { SearchInput } from '@/components/common/search-input';
import PlanetSelector from '@/components/query/planet-selector';
import { TagCard } from '@/components/tag/tag-card';
import TagSelector from '@/components/tag/tag-selector';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { usePreset } from '@/hooks/use-preset';
import { useTagFromQuery } from '@/hooks/use-tag-from-query';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

type TagIdSelectorProps = {
	type: ItemType;
	children?: React.ReactNode;
} & (
	| {
			returnType: 'id';
			value: string[];
			onValueChange: (value: string[]) => void;
	  }
	| {
			returnType: 'dto';
			value: ItemTagDto[];
			onValueChange: (value: ItemTagDto[]) => void;
	  }
);

export function TagIdSelector({ children, returnType, value, type, onValueChange }: TagIdSelectorProps) {
	const [open, setOpen] = useState(false);
	const [filter, setFilter] = useState('');
	const [planetId, setPlanetId] = useLocalStorage<string[]>('plannets', []);
	const { tags } = useTagFromQuery(type, planetId, []);

	const { t } = useI18n('tags');

	const selectedGroup = tags
		.map((cat) => ({ ...cat, tags: cat.tags.map((t) => ({ ...t, color: cat.color })) }))
		.filter((item) =>
			item.tags.some((tag) => (returnType === 'dto' ? value.some((v) => v.id === tag.id) : value.includes(tag.id))),
		)
		.map((item) => ({
			...item,
			tags: item.tags.filter((tag) =>
				returnType === 'dto' ? value.some((v) => v.id === tag.id) : value.includes(tag.id),
			),
		}));

	const selectedTagsFlat = selectedGroup.flatMap((group) => group.tags);
	const totalSelectedCount = selectedTagsFlat.length;

	const handleClearAll = () => {
		onValueChange([]);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button className="w-fit" variant="outline">
						{totalSelectedCount > 0 ? (
							<Tran
								text="tags.selected-tags"
								args={{ number: totalSelectedCount }}
							/>
						) : (
							<Tran text="tags.select-tags" />
						)}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="flex flex-col h-[88dvh] max-h-212.5 sm:max-w-4xl p-0 gap-0 overflow-hidden border-border bg-background shadow-2xl">
				{/* Dialog Header */}
				<DialogHeader className="px-4 py-3 border-b border-border/70 shrink-0 bg-card/40">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
								<Tran text="tag-selector-title" />
							</DialogTitle>
							{totalSelectedCount > 0 && (
								<span className="rounded-full border border-border/70 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
									{totalSelectedCount}
								</span>
							)}
						</div>
					</div>
					<DialogDescription className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
						<Tran
							text="tag-selector-desc"
						/>
					</DialogDescription>
				</DialogHeader>

				{/* Filter Toolbar */}
				<div className="px-4 py-2 border-b border-border/60 bg-card/20 flex flex-col gap-2 shrink-0">
					<div className="flex items-center gap-2">
						<SearchInput
							className="max-w-none flex-1 min-h-8 h-8 text-xs"
							value={filter}
							onChange={setFilter}
							placeholder={t('filter-tags-placeholder')}
						/>
						{totalSelectedCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearAll}
								className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0 gap-1"
							>
								<Trash2 className="size-3" />
								<span className="hidden sm:inline">
									<Tran text="clear-all" />
								</span>
								<span className="font-mono text-[11px]">({totalSelectedCount})</span>
							</Button>
						)}
					</div>

					<div className="flex items-center gap-2 overflow-x-auto pt-0.5 scrollbar-none">
						<PlanetSelector type="multiple" value={planetId} onValueSelected={setPlanetId} />
					</div>
				</div>

				{/* Scrollable Tag Content Area */}
				<div className="flex-1 overflow-y-auto px-4 py-3">
					<Suspense>
						<TagSelector
							filter={filter}
							value={selectedGroup}
							onValueChange={(groups) =>
								returnType === 'dto'
									? onValueChange(groups.flatMap((group) => group.tags))
									: onValueChange(groups.flatMap((group) => group.tags.map((tag) => tag.id)))
							}
							tags={tags}
						/>
					</Suspense>
				</div>

				{/* Dialog Footer Actions */}
				<DialogFooter className="px-4 py-2.5 border-t border-border/70 shrink-0 bg-card/30 flex flex-row items-center justify-between sm:justify-between w-full">
					<div>
						{returnType === 'dto' && value.length > 0 && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
										<Tran text="tags.save-as-preset" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className="sm:max-w-md w-[92vw]">
									<CreatePresetDialog type={type} tags={value} />
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>

					<DialogClose asChild>
						<Button size="sm" className="h-7 px-3.5 text-xs font-medium gap-1">
							<Check className="size-3" />
							<Tran text="done" />
						</Button>
					</DialogClose>
				</DialogFooter>

			</DialogContent>
		</Dialog>
	);
}

function CreatePresetDialog({ type, tags }: { type: ItemType; tags: ItemTagDto[] }) {
	const [name, setName] = useState('');
	const { addPreset } = usePreset();

	const { t } = useI18n('tags');

	const onSubmit = () => {
		addPreset({ name, type, tags });
		toast.success(t('preset-created-success'));
	};

	return (
		<>
			<AlertDialogHeader>
				<AlertDialogTitle className="text-sm font-semibold">
					<Tran text="tags.create-preset" />
				</AlertDialogTitle>
				<AlertDialogDescription className="text-xs text-muted-foreground">
					<Tran
						text="tags.create-preset-desc"
					/>
				</AlertDialogDescription>
			</AlertDialogHeader>

			<div className="space-y-2.5 py-1">
				<div className="space-y-1">
					<label htmlFor="preset-name" className="text-xs font-medium text-foreground">
						<Tran text="tags.preset-name" />
					</label>
					<Input
						id="preset-name"
						value={name}
						placeholder={t('preset-name-placeholder')}
						onChange={(event) => setName(event.currentTarget.value)}
						className="h-7 text-xs"
					/>
				</div>

				{tags.length > 0 && (
					<div className="space-y-1">
						<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
							<Tran text="tags.included-tags" /> ({tags.length})
						</span>
						<div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 rounded-md border border-border/60 bg-muted/20">
							{tags.map((tag) => (
								<TagCard key={tag.id} tag={tag} />
							))}
						</div>
					</div>
				)}
			</div>

			<AlertDialogFooter className="pt-2 border-t border-border/60">
				<AlertDialogCancel asChild>
					<Button variant="ghost" size="sm" className="h-7 text-xs">
						<Tran text="cancel" />
					</Button>
				</AlertDialogCancel>
				<AlertDialogAction asChild>
					<Button
						size="sm"
						onClick={onSubmit}
						disabled={name.trim().length === 0 || tags.length === 0}
						className="h-7 text-xs font-medium"
					>
						<Tran text="create" />
					</Button>
				</AlertDialogAction>
			</AlertDialogFooter>
		</>
	);
}


