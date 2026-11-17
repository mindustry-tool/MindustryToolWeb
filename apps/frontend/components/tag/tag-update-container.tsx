'use client';

import type { ItemTagDto } from '@mindustry-tool/api';
import type { ItemType } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Tag, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import ErrorMessage from '@/components/error/error-message';
import { TagCard } from '@/components/tag/tag-card';
import { TagIdSelector } from '@/components/tag/tag-id-selector';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiInstance } from '@/config/api';
import { usePreset } from '@/hooks/use-preset';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

export function TagUpdateContainer({
	className,
	tags,
	itemType,
	itemId,
	queryKey,
	onTagsChange,
}: {
	className?: string;
	itemType: ItemType;
	itemId: string;
	tags: ItemTagDto[];
	queryKey: string[];
	onTagsChange?: (tags: ItemTagDto[]) => void;
}) {
	const [selectedTags, setSelectedTags] = useState(tags);
	const queryClient = useQueryClient();

	const { mutate, isError, error } = useMutation({
		mutationKey: ['item', itemType, itemId, 'tag'],
		mutationFn: (value: ItemTagDto[]) =>
			apiInstance.request(api.v4.items.updateTags, {
				params: {
					itemType,
					id: itemId,
				},
				body: {
					tags: value.map((tag) => tag.id),
				},
			}),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const debounceMutate = useDebounceCallback(mutate, 500);

	useEffect(() => {
		if (selectedTags.length === 0) {
			return;
		}

		debounceMutate(selectedTags);
	}, [debounceMutate, selectedTags]);

	const handleTagsChange = useCallback(
		(newTags: ItemTagDto[]) => {
			setSelectedTags(newTags);
			onTagsChange?.(newTags);
		},
		[onTagsChange],
	);

	const handleRemoveTag = useCallback(
		(tagId: string) => {
			const updated = selectedTags.filter((tag) => tag.id !== tagId);
			setSelectedTags(updated);
			onTagsChange?.(updated);
		},
		[selectedTags, onTagsChange],
	);

	return (
		<div className={cn('space-y-1.5', className)}>
			<div className="flex items-center justify-between">
				<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
					<Tran text="tags" />
				</span>
				<div className="flex items-center gap-1.5">
					<TagIdSelector returnType="dto" type={itemType} value={selectedTags} onValueChange={handleTagsChange}>
						<Button variant="outline" size="sm" className="h-6 px-2 text-[11px] font-normal gap-1">
							<Tag className="size-3" />
							{selectedTags.length > 0 ? <Tran text="tag.edit" /> : <Tran text="tag.add" />}
						</Button>
					</TagIdSelector>
					<TagPresetSelector itemType={itemType} onSelect={handleTagsChange} />
				</div>
			</div>

			{selectedTags.length > 0 ? (
				<div className="flex flex-wrap gap-1">
					{selectedTags
						.sort((a, b) => (a.color || '').localeCompare(b.color || ''))
						.map((tag) => (
							<TagCard key={tag.id} tag={tag} onClick={() => handleRemoveTag(tag.id)} />
						))}
				</div>
			) : (
				<p className="text-[11px] text-muted-foreground/70">
					<Tran text="tag.none-warning" />
				</p>
			)}

			{isError && <ErrorMessage error={error} />}
		</div>
	);
}

function TagPresetSelector({ itemType, onSelect }: { itemType: ItemType; onSelect: (tags: ItemTagDto[]) => void }) {
	const { preset, deletePreset } = usePreset();
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="h-6 px-2 text-[11px] font-normal gap-1" variant="outline" size="sm">
					<Bookmark className="size-3" />
					<Tran text="tags.tag-preset" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					<Tran className="text-sm" text="tags.tag-preset" />
				</DialogTitle>
				<DialogDescription></DialogDescription>
				<section className="grid max-h-[70vh] gap-2 overflow-y-auto">
					{preset.length === 0 && <Tran className="text-center text-sm" text="tags.no-preset" />}
					{preset
						.filter((p) => p.type === itemType)
						.map((p) => (
							<div
								className="relative flex flex-col items-start justify-start gap-1 rounded-md border bg-card p-2"
								role="button"
								key={p.name}
								onClick={() => {
									onSelect(p.tags);
									setOpen(false);
								}}
							>
								<span className="text-xl font-semibold">{p.name}</span>
								<div className="flex flex-wrap gap-1">
									{p.tags.map((tag) => (
										<TagCard key={tag.id} tag={tag} />
									))}
								</div>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											className="absolute top-1 right-1"
											variant="ghost"
											size="icon"
											onClick={(e) => e.stopPropagation()}
										>
											<X />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogTitle>
											<Tran className="text-sm" text="confirm-delete" />
										</AlertDialogTitle>
										<AlertDialogDescription>
											<Tran className="text-sm" text="tags.confirm-delete-preset" />
										</AlertDialogDescription>
										<AlertDialogFooter>
											<AlertDialogCancel>
												<Tran className="text-sm" text="cancel" />
											</AlertDialogCancel>
											<AlertDialogAction asChild>
												<Button variant="destructive" onClick={() => deletePreset(p)}>
													<Tran className="text-sm" text="delete" />
												</Button>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						))}
				</section>
			</DialogContent>
		</Dialog>
	);
}
