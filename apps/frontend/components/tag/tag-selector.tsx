import type { FilterTag, FilterTagProps } from './tag-selector.types';
export type { FilterTag, FilterTagProps };
import type { TagCategoryWithTagsDto } from '@mindustry-tool/api';

import { useCallback, useMemo } from 'react';
import MultipleFilerTags from '@/components/tag/multiple-filter-tags';
import SingeFilerTags from '@/components/tag/single-filter-tags';
import { TagName } from '@/components/tag/tag-name';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';





const empty: FilterTag[] = [];

export default function TagSelector({ filter, tags, value, className, onValueChange }: FilterTagProps) {
	const { t } = useI18n('tags');

	const filteredTags = useMemo(
		() =>
			(filter.length === 0
				? tags
				: tags.map((tag) => {
						const v = { ...tag };
						v.tags = tag.tags.filter(
							(value) =>
								t(tag.name).toLowerCase().includes(filter.toLowerCase()) ||
								t(value.name).toLowerCase().includes(filter.toLowerCase()),
						);

						return v;
					})
			).filter((tag) => tag.tags.length > 0),
		[filter, tags, t],
	);

	if (filteredTags.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<p className="text-xs font-medium text-muted-foreground">
					<Tran text="no-item" />
				</p>
			</div>
		);
	}

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{filteredTags.map((group) => (
				<FilterTagGroup
					key={group.name}
					selectedGroup={value.find((v) => v.name === group.name)}
					group={group}
					onValueChange={(groupName, items) => {
						const currentGroup = value.find((v) => v.name === groupName);

						if (currentGroup) {
							const newValue = value.map((v) =>
								v.name === groupName ? { ...v, tags: items.map((item) => ({ ...item, color: currentGroup.color })) } : v,
							);
							onValueChange(newValue);
						} else {
							const originalGroup = tags.find((v) => v.name === groupName);
							if (originalGroup) {
								const newValue = [
									...value,
									{
										...originalGroup,
										tags: items.map((item) => ({ ...item, color: originalGroup.color })),
									},
								];
								onValueChange(newValue);
							} else {
								console.warn(`Not found group: ${groupName}`);
							}
						}
					}}
				/>
			))}
		</div>
	);
}

type FilterTagGroupProps = {
	group: TagCategoryWithTagsDto;
	selectedGroup?: TagCategoryWithTagsDto;
	onValueChange: (group: string, value: FilterTag[]) => void;
};

const FilterTagGroup = ({ group, selectedGroup, onValueChange }: FilterTagGroupProps) => {
	const handleMultipleValueChange = useCallback(
		(value: FilterTag[]) => onValueChange(group.name, value),
		[group.name, onValueChange],
	);

	const handleSingleValueChange = useCallback(
		(value: FilterTag) =>
			onValueChange(group.name, selectedGroup?.tags.some((v) => v.name === value.name) ? [] : [value]),
		[group.name, onValueChange, selectedGroup?.tags],
	);

	const selectedCount = selectedGroup?.tags.length ?? 0;

	return (
		<div className="rounded-md border border-border/60 bg-card/60 p-2 transition-colors">
			{/* Category Header */}
			<div className="flex items-center justify-between pb-1.5 mb-1 border-b border-border/40">
				<div className="flex items-center gap-1.5">
					<span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground">
						<TagName className="capitalize">{group.name}</TagName>
					</span>
					{selectedCount > 0 && (
						<span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
							{selectedCount}
						</span>
					)}
				</div>

				<div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 uppercase">
					<span>
						<Tran text={group.duplicate ? 'multi' : 'single'} />
					</span>
					<span>({group.tags.length})</span>
				</div>
			</div>

			{/* Tags list */}
			{group.duplicate ? (
				<MultipleFilerTags
					group={group}
					selectedValue={selectedGroup?.tags ?? empty}
					handleTagGroupChange={handleMultipleValueChange}
				/>
			) : (
				<SingeFilerTags
					group={group}
					selectedValue={selectedGroup?.tags[0]}
					handleTagGroupChange={handleSingleValueChange}
				/>
			)}
		</div>
	);
};


