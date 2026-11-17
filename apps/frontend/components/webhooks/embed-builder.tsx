'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';
import { Plus, Trash2 } from 'lucide-react';
import {
	DiscordEmbed,
	DiscordEmbedField,
	formatEmbedColor,
} from './discord-embed-preview';

const PRESET_COLORS = [
	{ name: 'Blurple', hex: '#5865f2', decimal: 5793266 },
	{ name: 'Green', hex: '#57f287', decimal: 5763719 },
	{ name: 'Yellow', hex: '#fee75c', decimal: 16705372 },
	{ name: 'Fuchsia', hex: '#eb459e', decimal: 15418782 },
	{ name: 'Red', hex: '#ed4245', decimal: 15548997 },
	{ name: 'Dark', hex: '#2f3136', decimal: 3092790 },
];

export function EmbedBuilder({
	embed,
	onChange,
}: {
	embed: DiscordEmbed;
	onChange: (embed: DiscordEmbed) => void;
}) {
	const handleTitleChange = (title: string) => {
		onChange({ ...embed, title });
	};

	const handleDescriptionChange = (description: string) => {
		onChange({ ...embed, description });
	};

	const handleColorChange = (hexColor: string) => {
		// Convert hex string to integer
		const cleanHex = hexColor.replace('#', '');
		const num = parseInt(cleanHex, 16);
		onChange({ ...embed, color: isNaN(num) ? undefined : num });
	};

	const handleAuthorNameChange = (name: string) => {
		onChange({
			...embed,
			author: { ...embed.author, name },
		});
	};

	const handleAuthorIconChange = (icon_url: string) => {
		onChange({
			...embed,
			author: { ...embed.author, icon_url },
		});
	};

	const handleFooterTextChange = (text: string) => {
		onChange({
			...embed,
			footer: { ...embed.footer, text },
		});
	};

	const handleFooterIconChange = (icon_url: string) => {
		onChange({
			...embed,
			footer: { ...embed.footer, icon_url },
		});
	};

	const handleAddField = () => {
		const fields = [...(embed.fields || []), { name: '', value: '', inline: false }];
		onChange({ ...embed, fields });
	};

	const handleRemoveField = (index: number) => {
		const fields = (embed.fields || []).filter((_, idx) => idx !== index);
		onChange({ ...embed, fields });
	};

	const handleFieldChange = (
		index: number,
		key: keyof DiscordEmbedField,
		val: any,
	) => {
		const fields = [...(embed.fields || [])];
		const current = fields[index] || { name: '', value: '', inline: false };
		fields[index] = {
			name: current.name || '',
			value: current.value || '',
			inline: current.inline || false,
			[key]: val,
		};
		onChange({ ...embed, fields });
	};

	const { t } = useI18n('webhooks');
	const currentColorHex = formatEmbedColor(embed.color);

	return (
		<div className="flex flex-col gap-3 text-sm">
			{/* Title & Description */}
			<div className="grid grid-cols-1 gap-2.5">
				<div className="flex flex-col gap-1">
					<Label className="text-xs font-medium"><Tran text="title" /></Label>
					<Input
						value={embed.title || ''}
						onChange={(e) => handleTitleChange(e.target.value)}
						placeholder={t('embed-title-placeholder')}
					/>
				</div>

				<div className="flex flex-col gap-1">
					<Label className="text-xs font-medium"><Tran text="description" /></Label>
					<Textarea
						value={embed.description || ''}
						onChange={(e) => handleDescriptionChange(e.target.value)}
						placeholder={t('embed-description-placeholder')}
						className="min-h-18"
					/>
				</div>
			</div>

			{/* Sidebar Color */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium"><Tran text="sidebar-color" /></Label>
				<div className="flex items-center gap-2 flex-wrap">
					<input
						type="color"
						value={currentColorHex}
						onChange={(e) => handleColorChange(e.target.value)}
						className="w-8 h-8 rounded cursor-pointer border bg-transparent p-0.5"
					/>
					<Input
						value={currentColorHex}
						onChange={(e) => handleColorChange(e.target.value)}
						className="w-28 font-mono text-xs h-8"
						placeholder="#5865F2"
					/>
					<div className="flex items-center gap-1.5">
						{PRESET_COLORS.map((preset) => (
							<button
								key={preset.name}
								type="button"
								onClick={() => onChange({ ...embed, color: preset.decimal })}
								style={{ backgroundColor: preset.hex }}
								className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
								title={preset.name}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Author Section */}
			<div className="flex flex-col gap-1.5 pt-1">
				<Label className="text-xs font-medium text-muted-foreground"><Tran text="author" /></Label>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<Input
						value={embed.author?.name || ''}
						onChange={(e) => handleAuthorNameChange(e.target.value)}
					placeholder={t('author-name-placeholder')}
					className="h-8 text-xs"
				/>
				<Input
					value={embed.author?.icon_url || ''}
					onChange={(e) => handleAuthorIconChange(e.target.value)}
					placeholder={t('author-icon-url-placeholder')}
						className="h-8 text-xs"
					/>
				</div>
			</div>

			{/* Footer Section */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-muted-foreground"><Tran text="footer" /></Label>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<Input
						value={embed.footer?.text || ''}
						onChange={(e) => handleFooterTextChange(e.target.value)}
					placeholder={t('footer-text-placeholder')}
					className="h-8 text-xs"
				/>
				<Input
					value={embed.footer?.icon_url || ''}
					onChange={(e) => handleFooterIconChange(e.target.value)}
					placeholder={t('footer-icon-url-placeholder')}
						className="h-8 text-xs"
					/>
				</div>
			</div>

			{/* Fields Section */}
			<div className="flex flex-col gap-2 pt-1">
				<Label className="text-xs font-medium text-muted-foreground">
					Fields ({embed.fields?.length || 0})
				</Label>

				{embed.fields && embed.fields.length > 0 && (
					<div className="flex flex-col gap-2">
						{embed.fields.map((field, idx) => (
							<div
								key={idx}
								className="flex flex-col gap-2 p-2.5 border rounded-md bg-secondary/20"
							>
								<div className="flex items-center gap-2">
									<Input
										value={field.name}
										onChange={(e) =>
											handleFieldChange(idx, 'name', e.target.value)
										}
										placeholder={t('field-name-placeholder')}
										className="font-medium text-xs h-8"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveField(idx)}
										className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
								<Textarea
									value={field.value}
									onChange={(e) =>
										handleFieldChange(idx, 'value', e.target.value)
									}
									placeholder={t('field-value-placeholder')}
									className="text-xs min-h-12"
								/>
								<div className="flex items-center gap-2 pt-0.5">
									<Checkbox
										id={`inline-${idx}`}
										checked={field.inline || false}
										onCheckedChange={(checked) =>
											handleFieldChange(idx, 'inline', Boolean(checked))
										}
									/>
									<label
										htmlFor={`inline-${idx}`}
										className="text-xs text-muted-foreground cursor-pointer"
									>
										<Tran text="inline-field" />
									</label>
								</div>
							</div>
						))}
					</div>
				)}

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddField}
					className="w-full h-8 text-xs gap-1 mt-1"
				>
					<Plus className="w-3.5 h-3.5" />
					<Tran text="add-field" />
				</Button>
			</div>
		</div>
	);
}
