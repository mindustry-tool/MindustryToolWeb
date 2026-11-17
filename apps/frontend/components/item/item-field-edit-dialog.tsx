'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import ColorText from '@/components/common/color-text';
import { Button } from '@/components/ui/button';
import { Tran } from '@/i18n/tran';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ItemFieldEditDialogProps {
	title: string;
	description?: string;
	value: string;
	fieldKey: 'name' | 'description';
	queryKey: string[];
	multiline?: boolean;
	maxLength?: number;
	placeholder?: string;
	triggerTitle?: string;
	triggerClassName?: string;
	onSave: (value: string) => Promise<any>;
}

export function ItemFieldEditDialog({
	title,
	description,
	value,
	fieldKey,
	queryKey,
	multiline = false,
	maxLength,
	placeholder,
	triggerTitle = 'Edit',
	triggerClassName,
	onSave,
}: ItemFieldEditDialogProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value);
	const queryClient = useQueryClient();

	// Sync local draft with prop when value changes while dialog is closed
	useEffect(() => {
		if (!open) {
            setTimeout(() => setDraft(value), 0);
		}
	}, [value, open]);

	const { mutate, isPending } = useMutation({
		mutationFn: async (newValue: string) => {
			return await onSave(newValue);
		},
		onMutate: async (newValue: string) => {
			await queryClient.cancelQueries({ queryKey });
			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (old: any) => {
				if (!old) return old;
				return { ...old, [fieldKey]: newValue };
			});

			return { previousData };
		},
		onError: (err: any, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
			toast.error('Failed to update', {
				description: err?.message ?? 'An error occurred while saving.',
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const debouncedMutate = useDebounceCallback((val: string) => {
		mutate(val);
	}, 500);

	// Auto flush on component unmount
	useEffect(() => {
		return () => {
			debouncedMutate.flush();
		};
	}, [debouncedMutate]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			// Auto flush any pending debounced mutation when closing
			debouncedMutate.flush();
		} else {
			setDraft(value);
		}
		setOpen(nextOpen);
	};

	const handleChange = (newVal: string) => {
		if (maxLength !== undefined && newVal.length > maxLength) {
			newVal = newVal.slice(0, maxLength);
		}
		setDraft(newVal);
		debouncedMutate(newVal);
	};

	const handleSaveAndClose = () => {
		debouncedMutate.flush();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className={cn(
						'size-6 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0',
						triggerClassName,
					)}
					title={triggerTitle}
				>
					<Pencil className="size-3.5" />
					<span className="sr-only">{triggerTitle}</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold">{title}</DialogTitle>
					{description && <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>}
				</DialogHeader>

				<div className="space-y-3 py-2">
					<div className="space-y-1.5">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<label htmlFor={`edit-field-${fieldKey}`} className="font-medium">
								{fieldKey === 'name' ? 'Name' : 'Description'}
							</label>
							{maxLength !== undefined && (
								<span
									className={cn(
										'font-mono text-[11px]',
										draft.length >= maxLength ? 'text-destructive font-semibold' : 'text-muted-foreground',
									)}
								>
									{draft.length} / {maxLength}
								</span>
							)}
						</div>

						{multiline ? (
							<Textarea
								id={`edit-field-${fieldKey}`}
								value={draft}
								onChange={(e) => handleChange(e.target.value)}
								placeholder={placeholder}
								className="min-h-32 text-xs font-mono resize-y"
								maxLength={maxLength}
							/>
						) : (
							<Input
								id={`edit-field-${fieldKey}`}
								value={draft}
								onChange={(e) => handleChange(e.target.value)}
								placeholder={placeholder}
								className="text-xs font-mono"
								maxLength={maxLength}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSaveAndClose();
									}
								}}
							/>
						)}
					</div>

					{/* Live Mindustry ColorText Preview */}
					{draft.trim().length > 0 && (
						<div className="space-y-1 rounded-md border border-border/60 bg-muted/30 p-2.5">
							<div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"><Tran text="preview" /></div>
							<div
								className={cn(
									'text-xs text-foreground leading-normal',
									multiline ? 'whitespace-pre-wrap max-h-32 overflow-y-auto' : 'truncate',
								)}
							>
								<ColorText text={draft} />
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="flex items-center justify-end gap-2 pt-2">
					<Button
						type="button"
						size="sm"
						onClick={handleSaveAndClose}
						disabled={isPending}
						className="h-8 px-3 text-xs"
					>
						{isPending ? 'Saving...' : 'Done'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
