'use client';

import type { TagCategoryWithTagsDto, TagDto, TagGroupDto } from '@mindustry-tool/api';
import type { Identifier } from 'dnd-core';
import { api } from '@mindustry-tool/api';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, PlusIcon, Trash } from 'lucide-react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useMemo, useRef, useState } from 'react';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EllipsisButton } from '@/components/buttons/ellipsis-button';
import ErrorMessage from '@/components/error/error-message';
import TagIcon from '@/components/tag/tag-icon';
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

import { toast } from '@/components/ui/sonner';

import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/common/page-wrapper';
import ScrollContainer from '@/components/common/scroll-container';

const CreateTagGroupDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-group-dialog'),
);
const DeleteTagGroupDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-group-dialog'),
);

const CreatePlanetDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-planet-dialog'),
);
const UpdatePlanetDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-planet-dialog'),
);
const DeletePlanetDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-planet-dialog'),
);

const CreateTagDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-dialog'),
);
const DeleteTagDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-dialog'),
);
const UpdateTagDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-dialog'),
);

const CreateTagCategoryDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/create-tag-category-dialog'),
);
const DeleteTagCategoryDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/delete-tag-category-dialog'),
);
const UpdateTagCategoryDialog = dynamic(
	() => import('@/app/[locale]/(with-navbar)/(admin)/data/tags/components/update-tag-category-dialog'),
);

export default function PageClient() {
	const [selectedPlanet, setSelectedPlanet] = useState<string | undefined>(undefined);
	const [openTagGroupDialog, setOpenTagGroupDialog] = useState(false);
	const [openTagDialog, setOpenTagDialog] = useState(false);
	const [openCategoryDialog, setOpenCategoryDialog] = useState(false);

	return (
		<DndProvider backend={HTML5Backend}>
			<PageWrapper>
				<ScrollContainer>
					<div className="flex w-full flex-wrap gap-2">
						<PlanetFilter value={selectedPlanet} onValueSelected={setSelectedPlanet} />
						<Dialog open={openTagDialog} onOpenChange={setOpenTagDialog}>
							<DialogTrigger asChild>
								<Button title="server.add">
									<Tran text="tags.add" />
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-card p-6">
								<DialogTitle>
									<Tran text="tags.add" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreatePlanetDialog onSuccess={() => setOpenTagDialog(false)} />
							</DialogContent>
						</Dialog>
					</div>
					<div className="w-full border-t" />
					<div>
						<Dialog open={openTagGroupDialog} onOpenChange={setOpenTagGroupDialog}>
							<DialogTrigger asChild>
								<Button>
									<Tran text="tags.group-add" />
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-card p-6">
								<DialogTitle>
									<Tran text="tags.add-group" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateTagGroupDialog currentCategories={[]} onSuccess={() => setOpenTagGroupDialog(false)} />
							</DialogContent>
						</Dialog>
					</div>
					<TagGroupList />
					<div className="w-full border-t" />
					<TagList planetId={selectedPlanet} />
					<div className="fixed right-4 bottom-4 z-20">
						<Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
							<DialogTrigger asChild>
								<Button className="min-w-20" title="server.add">
									<Tran text="tags.add-category" />
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-card p-6">
								<DialogTitle>
									<Tran text="tags.add-category" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<CreateTagCategoryDialog onSuccess={() => setOpenCategoryDialog(false)} />
							</DialogContent>
						</Dialog>
					</div>
				</ScrollContainer>
			</PageWrapper>
		</DndProvider>
	);
}

function PlanetFilter({
	value,
	onValueSelected,
}: {
	value?: string | undefined;
	onValueSelected: (planetId?: string) => void;
}) {
	const [openPlanetDialog, setOpenPlanetDialog] = useState(false);
	const { data } = useQuery({
		queryKey: ['planets'],
		queryFn: () => apiInstance.request(api.v4.planets.findAll, {}),
	});

	return (
		<>
			{data?.map((planet) => (
				<div className="flex w-fit shrink-0 items-center gap-1" key={planet.id}>
					<Button
						className="flex"
						variant={value === planet.id ? 'default' : 'outline'}
						onClick={() => onValueSelected(value === planet.id ? undefined : planet.id)}
					>
						{planet.icon && (
							<Image
								className="flex size-8 items-center justify-center overflow-hidden rounded-full object-cover"
								key={planet.icon}
								width={48}
								height={48}
								src={planet.icon}
								loader={({ src }) => src}
								alt={planet.name}
							/>
						)}
						{planet.name}({planet.position})
					</Button>
					<EllipsisButton variant="secondary" size="icon">
						<Dialog open={openPlanetDialog} onOpenChange={setOpenPlanetDialog}>
							<DialogTrigger asChild>
								<Button className="justify-between p-2" title="server.edit" variant="ghost">
									<Tran text="tags.edit-planet" />
									<Pencil />
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-card p-6">
								<DialogTitle>
									<Tran text="tags.edit" />
								</DialogTitle>
								<VisuallyHidden>
									<DialogDescription />
								</VisuallyHidden>
								<UpdatePlanetDialog planet={planet} onSuccess={() => setOpenPlanetDialog(false)} />
							</DialogContent>
						</Dialog>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="justify-between" variant="destructive">
									<Tran text="delete" />
									<Trash />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogTitle>
									<Tran text="delete" />
								</AlertDialogTitle>
								<VisuallyHidden>
									<AlertDialogDescription />
								</VisuallyHidden>
								<AlertDialogFooter>
									<AlertDialogCancel>
										<Tran text="cancel" />
									</AlertDialogCancel>
									<AlertDialogAction asChild>
										<DeletePlanetDialog planet={planet} />
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</EllipsisButton>
				</div>
			))}
		</>
	);
}

function TagGroupList() {
	const { data, isError, error } = useQuery({
		queryKey: ['tag-groups'],
		queryFn: async () => apiInstance.request(api.v4.tags.groups.findAll, {}),
	});

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return data?.map((group) => <GroupCard key={group.group} group={group} />);
}

type GroupCardProps = {
	group: TagGroupDto;
};

function GroupCard({ group }: GroupCardProps) {
	const { group: name, categories } = group;
	const [hoverIndex, setHoverId] = useState<number>();
	const [openTagGroupDialog, setOpenTagGroupDialog] = useState(false);

	const queryClient = useQueryClient();

	const countMap: Record<number, number> = useMemo(() => {
		const map: Record<number, number> = {};
		categories.forEach((category) => {
			map[category.position] = (map[category.position] || 0) + 1;
		});

		return map;
	}, [categories]);

	const { mutate } = useMutation({
		mutationKey: ['tag-group'],
		mutationFn: ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => {
			const category1 = categories[dragIndex];
			const category2 = categories[hoverIndex];

			if (!category1 || !category2) {
				throw new Error('Role not found');
			}

			const newCategory1 = { ...category1, position: hoverIndex };
			const newCategory2 = { ...category2, position: dragIndex };

			return Promise.all([
				apiInstance.request(api.v4.tags.categories.update, {
					params: {
						id: newCategory1.id,
					},
					body: {
						position: newCategory1.position,
					},
				}),
				apiInstance.request(api.v4.tags.categories.update, {
					params: {
						id: newCategory2.id,
					},
					body: {
						position: newCategory2.position,
					},
				}),
			]);
		},
		onError: (error) =>
			toast.error(<Tran text="upload.fail" />, { description: error.message }),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
		},
	});

	function onDrop(dragIndex: number, hoverIndex: number) {
		setHoverId(undefined);
		mutate({ dragIndex, hoverIndex });
	}

	return (
		<div className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-[128px_1fr] shadow-lg">
			<span className="text-lg">{name}</span>
			<div className="flex flex-wrap gap-2">
				{categories.map((category, index) => (
					<GroupCategoryCard
						index={index}
						isHovered={index === hoverIndex}
						key={category.id}
						group={group}
						category={category}
						onDrop={onDrop}
						onHover={setHoverId}
						isDuplicatePosition={countMap[category.position]! > 1}
					/>
				))}
				<Dialog open={openTagGroupDialog} onOpenChange={setOpenTagGroupDialog}>
					<DialogTrigger asChild>
						<Button variant="outline" size="icon">
							<Plus />
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-card p-6">
						<DialogTitle>
							<Tran text="tags.add-group" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<CreateTagGroupDialog
							group={group.group}
							currentCategories={categories.map((item) => item.id)}
							onSuccess={() => setOpenTagGroupDialog(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

type GroupCategoryCardProps = {
	group: TagGroupDto;
	category: TagGroupDto['categories'][number];
	isHovered: boolean;
	index: number;
	isDuplicatePosition: boolean;
	onDrop: (dragIndex: number, hoverIndex: number) => void;
	onHover: (hoverIndex: number) => void;
};

type DragItem = {
	id: number;
	type: string;
};

function GroupCategoryCard({ group, category, index, isDuplicatePosition, onDrop, onHover }: GroupCategoryCardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const { id, name, position, color } = category;

	const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
		accept: group.group.toString(),
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			};
		},
		drop(item: DragItem) {
			if (!ref.current) {
				return;
			}

			onDrop(item.id, index);
		},
		hover() {
			if (!ref.current) {
				return;
			}

			onHover(index);
		},
	});

	const [{ isDragging }, drag] = useDrag({
		type: group.group.toString(),
		item: () => {
			return { id: index };
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	// eslint-disable-next-line react-hooks/refs
	drag(drop(ref));

	return (
		<div
			className={cn(
				'flex px-2 py-1 gap-2 h-9 items-center text-sm rounded-lg border bg-secondary text-muted-foreground group',
				{
					'border opacity-50 border-primary': isDragging,
					'border-destructive': isDuplicatePosition,
				},
			)}
			ref={ref}
			data-handler-id={handlerId}
		>
			<span className="font-bold text-primary">{position.toString().padStart(3, '0')}</span>
			<span style={{ color: color }}>
				<span className="text-nowrap">{name}</span>
			</span>
			<EllipsisButton variant="ghost">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button className="justify-between" variant="destructive">
							<Tran text="delete" />
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogTitle>
							<Tran text="delete" />
						</AlertDialogTitle>
						<VisuallyHidden>
							<AlertDialogDescription />
						</VisuallyHidden>
						<AlertDialogFooter>
							<AlertDialogCancel>
								<Tran text="cancel" />
							</AlertDialogCancel>
							<AlertDialogAction asChild>
								<DeleteTagGroupDialog group={group.group} categoryId={id} />
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</EllipsisButton>
		</div>
	);
}

type TagListProps = {
	planetId?: string;
};

function TagList({ planetId }: TagListProps) {
	const { data, isError, error } = useQuery({
		queryKey: ['tag-detail', planetId],
		queryFn: () =>
			apiInstance.request(api.v4.tags.getTagsDetail, {
				query: { planetId },
			}),
	});

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	return data?.map((category) => <TagCategoryCard key={category.id} category={category} planetId={planetId} />);
}

type TagCategoryCardProps = {
	category: TagCategoryWithTagsDto;
	planetId?: string;
};

function TagCategoryCard({ category, planetId }: TagCategoryCardProps) {
	const { color, name, tags, position } = category;

	const queryClient = useQueryClient();
	const [hoverIndex, setHoverId] = useState<number>();
	const [openTagCategoryDialog, setOpenTagCategoryDialog] = useState<boolean>(false);
	const [openTagDialog, setOpenTagDialog] = useState(false);

	const countMap: Record<number, number> = useMemo(() => {
		const map: Record<number, number> = {};
		tags.forEach((tag) => {
			map[tag.position] = (map[tag.position] || 0) + 1;
		});

		return map;
	}, [tags]);

	const { mutate } = useMutation({
		mutationKey: ['tag-detail'],
		mutationFn: async ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => {
			const tag1 = tags[dragIndex];
			const tag2 = tags[hoverIndex];

			if (!tag1) {
				throw new Error('Drag tag not found');
			}

			if (!tag2) {
				throw new Error('Hover tag not found');
			}

			const newTag1 = { ...tag1, position: hoverIndex };
			const newTag2 = { ...tag2, position: dragIndex };

			return Promise.all([
				apiInstance.request(api.v4.tags.update, {
					params: {
						id: newTag1.id,
					},
					body: newTag1,
				}),
				apiInstance.request(api.v4.tags.update, {
					params: {
						id: newTag2.id,
					},
					body: newTag2,
				}),
			]);
		},
		onError: (error) =>
			toast.error(<Tran text="upload.fail" />, { description: error.message }),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['tag-detail'] });
		},
	});

	function onDrop(dragIndex: number, hoverIndex: number) {
		setHoverId(undefined);
		mutate({ dragIndex, hoverIndex });
	}

	const largestPosition = tags.reduce((max, tag) => Math.max(max, tag.position), 0);

	return (
		<div className="grid grid-cols-[auto_128px_1fr_40px] items-start gap-2 rounded-lg border bg-card p-4 shadow-lg">
			<span className="font-bold overflow-hidden text-primary">{position.toString().padStart(3, '0')}</span>
			<span className="overflow-hidden text-ellipsis" style={{ color }}>
				{name}
			</span>
			<div className="flex flex-wrap gap-2">
				{tags.map((tag, index) => (
					<TagCard
						key={tag.id}
						index={index}
						isHovered={hoverIndex === index}
						tag={tag}
						onDrop={onDrop}
						onHover={setHoverId}
						isDuplicatePosition={countMap[tag.position]! > 1}
					/>
				))}
				<Dialog open={openTagDialog} onOpenChange={setOpenTagDialog}>
					<DialogTrigger asChild>
						<Button size="icon" variant="outline" title="server.add">
							<PlusIcon />
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-card p-6">
						<DialogTitle>
							<Tran text="tags.add" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<CreateTagDialog
							categoryId={category.id}
							planetId={planetId}
							position={largestPosition + 1}
							onSuccess={() => setOpenTagDialog(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>
			<EllipsisButton className="p-0" variant="ghost">
				<Dialog open={openTagCategoryDialog} onOpenChange={setOpenTagCategoryDialog}>
					<DialogTrigger asChild>
						<Button className="justify-between p-2" title="server.edit" variant="ghost">
							<Tran text="tags.edit-category" />
							<Pencil />
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-card p-6">
						<DialogTitle>
							<Tran text="tags.edit" />
						</DialogTitle>
						<VisuallyHidden>
							<DialogDescription />
						</VisuallyHidden>
						<UpdateTagCategoryDialog category={category} onSuccess={() => setOpenTagCategoryDialog(false)} />
					</DialogContent>
				</Dialog>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button className="justify-between" variant="destructive">
							<Tran text="delete" />
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogTitle>
							<Tran text="delete" />
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Tran text="tags.delete-confirm" args={{ name }} />
						</AlertDialogDescription>
						<AlertDialogFooter>
							<AlertDialogCancel>
								<Tran text="cancel" />
							</AlertDialogCancel>
							<AlertDialogAction asChild>
								<DeleteTagCategoryDialog category={category} />
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</EllipsisButton>
		</div>
	);
}

type TagCardProps = {
	tag: TagDto;
	index: number;
	isHovered: boolean;
	onDrop: (dragIndex: number, hoverIndex: number) => void;
	onHover: (hoverIndex: number) => void;
	isDuplicatePosition: boolean;
};

function TagCard({ tag, isHovered, index, onDrop, onHover, isDuplicatePosition }: TagCardProps) {
	const { icon, name, categoryId, position, planetIds } = tag;

	const [open, setOpen] = useState(false);

	const ref = useRef<HTMLDivElement>(null);
	const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
		accept: categoryId.toString(),
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			};
		},
		drop(item: DragItem) {
			if (!ref.current) {
				return;
			}

			onDrop(item.id, index);
		},
		hover() {
			if (!ref.current) {
				return;
			}

			onHover(index);
		},
	});

	const [{ isDragging }, drag] = useDrag({
		type: categoryId.toString(),
		item: () => {
			return { id: index };
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	// eslint-disable-next-line react-hooks/refs
	drag(drop(ref));

	return (
		<div
			className={cn('h-9 flex gap-2 items-center px-2 text-sm rounded-lg border bg-secondary text-muted-foreground', {
				'border border-success': isHovered,
				'border opacity-50 border-primary': isDragging,
				'border border-destructive': isDuplicatePosition,
			})}
			ref={ref}
			data-handler-id={handlerId}
		>
			<span
				className={cn('font-bold text-primary', {
					'text-emerald-500': planetIds.length === 0,
				})}
			>
				{position}
			</span>
			<TagIcon>{icon}</TagIcon>
			<span>{name}</span>
			<div className="ml-auto">
				<EllipsisButton variant="ghost" className="p-0 text-muted-foreground">
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button className="justify-between" title="server.edit" variant="ghost">
								<Tran text="tags.edit" />
								<Pencil />
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-card p-6">
							<DialogTitle>
								<Tran text="tags.edit" />
							</DialogTitle>
							<VisuallyHidden>
								<DialogDescription />
							</VisuallyHidden>
							<UpdateTagDialog tag={tag} onSuccess={() => setOpen(false)} />
						</DialogContent>
					</Dialog>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button className="justify-between" variant="destructive">
								<Tran text="delete" />
								<Trash />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle>
								<Tran text="delete" />
							</AlertDialogTitle>
							<VisuallyHidden>
								<AlertDialogDescription />
							</VisuallyHidden>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<Tran text="cancel" />
								</AlertDialogCancel>
								<AlertDialogAction asChild>
									<DeleteTagDialog tag={tag} />
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</EllipsisButton>
			</div>
		</div>
	);
}
