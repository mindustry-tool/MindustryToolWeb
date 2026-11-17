'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { api } from '@mindustry-tool/api';
import { cn } from '@/lib/utils';

export const REJECT_PRESET_REASONS = [
	{ id: 'duplicated', text: 'Duplicated', tranKey: 'moderation.preset-duplicated' },
	{ id: 'nsfw', text: 'NSFW', tranKey: 'moderation.preset-nsfw' },
	{ id: 'bad-ratio', text: 'Bad ratio', tranKey: 'moderation.preset-bad-ratio' },
	{ id: 'no-uses', text: 'No uses', tranKey: 'moderation.preset-no-uses' },
] as const;

export interface RejectItemDialogProps {
	id: string;
	itemType: string;
	queryKey: string[];
	trigger?: React.ReactNode;
	className?: string;
}

export function RejectItemDialog({
	id,
	itemType,
	queryKey,
	trigger,
	className,
}: RejectItemDialogProps) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('');
	const queryClient = useQueryClient();

	const { t } = useI18n();

	const mutationKey = ['verification', 'reject', itemType, id];

	const { mutate, isPending } = useMutation({
		mutationKey,
		mutationFn: async () => {
			const trimmed = reason.trim();
			return apiInstance.request(api.v4.verification.reject, {
				params: { itemType, id },
				body: trimmed ? { reason: trimmed } : undefined,
			});
		},
		onError: (error: any) => {
			toast.error(<Tran text="error" />, {
				description: error?.message || t('failed-to-reject'),
			});
		},
		onSuccess: () => {
			toast.success(<Tran text="success" />);
			queryClient.invalidateQueries({ queryKey, exact: false });
			setOpen(false);
			setReason('');
		},
	});

	const handlePresetClick = (presetText: string) => {
		setReason((prev) => {
			const trimmed = prev.trim();
			if (!trimmed) {
				return presetText;
			}
			if (trimmed.includes(presetText)) {
				return prev;
			}
			return `${trimmed}, ${presetText}`;
		});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setReason('');
		}
		setOpen(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger ? (
					trigger
				) : (
					<Button
						variant="command-destructive"
						className={cn('justify-start', className)}
					>
						<X className="size-4 mr-1.5" />
						<Tran text="reject" />
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold">
						<Tran text="moderation.reject-dialog-title" />
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground">
						<Tran text="moderation.reject-dialog-desc" />
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-1">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground">
							<Tran text="moderation.presets" />
						</label>
						<div className="flex flex-wrap gap-1.5">
							{REJECT_PRESET_REASONS.map((preset) => {
								const isSelected = reason.includes(preset.text);
								return (
									<Button
										key={preset.id}
										type="button"
										variant={isSelected ? 'secondary' : 'outline'}
										size="sm"
										className={cn(
											'h-7 px-2.5 text-xs font-normal rounded-full transition-colors',
											isSelected && 'border-primary/40 bg-primary/10 text-primary font-medium',
										)}
										onClick={() => handlePresetClick(preset.text)}
									>
										<Tran text={preset.tranKey} />
									</Button>
								);
							})}
						</div>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<label htmlFor={`reject-reason-${id}`} className="font-medium">
								<Tran text="custom-reason-label" />
							</label>
							<span
								className={cn(
									'font-mono text-[11px]',
									reason.length >= 500 ? 'text-destructive font-semibold' : 'text-muted-foreground',
								)}
							>
								{reason.length} / 500
							</span>
						</div>
						<Textarea
							id={`reject-reason-${id}`}
							placeholder={t('custom-reason-placeholder')}
							value={reason}
							maxLength={500}
							onChange={(e) => setReason(e.target.value)}
							rows={3}
							className="text-xs resize-none"
						/>
					</div>
				</div>

				<DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						<Tran text="cancel" />
					</Button>
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onClick={() => mutate()}
						disabled={isPending}
					>
						<X className="size-3.5 mr-1" />
						<Tran text="confirm-reject" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default RejectItemDialog;
