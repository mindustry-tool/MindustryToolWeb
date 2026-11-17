'use client';

import type { ApiBody, ServerDto } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminUpdateServerSchema, api, hasAccess } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormError, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { apiInstance } from '@/config/api';
import { useSession } from '@/hooks/use-session';
import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

type AdminUpdateFormValues = ApiBody<typeof api.v4.servers.adminUpdate>;

type ResourceFieldConfig = {
	name: 'cpu' | 'memory';
	labelKey: 'server.cpu' | 'server.ram';
	min: number;
	max: number;
	step: number;
	unit: string;
	round: (value: number) => number;
};

const RESOURCE_FIELDS: ResourceFieldConfig[] = [
	{
		name: 'cpu',
		labelKey: 'server.cpu',
		min: 0.1,
		max: 4,
		step: 0.1,
		unit: 'vCPU',
		round: (value) => Math.round(value * 10) / 10,
	},
	{
		name: 'memory',
		labelKey: 'server.ram',
		min: 128,
		max: 4096,
		step: 128,
		unit: 'MB',
		round: (value) => Math.round(value),
	},
];

function ResourceRangeField({
	control,
	config,
	disabled,
}: {
	control: Control<AdminUpdateFormValues>;
	config: ResourceFieldConfig;
	disabled: boolean;
}) {
	const { name, labelKey, min, max, step, unit, round } = config;

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const numericValue = Number.isFinite(field.value) ? field.value : '';
				const sliderValue = Number.isFinite(field.value) ? Math.min(max, Math.max(min, field.value)) : min;

				return (
					<FormItem>
						<div className="flex items-center justify-between gap-4">
							<FormLabel>
								<Tran text={labelKey} />
							</FormLabel>
							<div className="flex items-center gap-2">
								<Input
									className="w-24 text-right tabular-nums"
									type="number"
									min={min}
									max={max}
									step={step}
									disabled={disabled}
									value={numericValue}
									onChange={(e) => {
										const next = e.currentTarget.valueAsNumber;
										field.onChange(Number.isFinite(next) ? round(next) : next);
									}}
								/>
								<span className="w-10 text-sm text-muted-foreground">{unit}</span>
							</div>
						</div>
						<FormControl>
							<Slider
								min={min}
								max={max}
								step={step}
								disabled={disabled}
								value={[sliderValue]}
								onValueChange={([next]) => {
									if (next !== undefined) {
										field.onChange(round(next));
									}
								}}
							/>
						</FormControl>
						<FormDescription className="flex justify-between text-xs">
							<span>
								{min} {unit}
							</span>
							<span>
								{max} {unit}
							</span>
						</FormDescription>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}

export function AdminServerSettingForm({ server }: { server: ServerDto }) {
	const { session } = useSession();

	const canEdit = hasAccess(session, 'server:manage');
	const queryClient = useQueryClient();

	const form = useForm<AdminUpdateFormValues>({
		resolver: zodResolver(adminUpdateServerSchema),
		defaultValues: {
			isDefault: server.isDefault,
			isOfficial: server.isOfficial,
			isAutoTurnOff: server.isAutoTurnOff,
			isHub: server.isHub,
			cpu: server.cpu,
			memory: server.memory,
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (body: AdminUpdateFormValues) =>
			apiInstance.request(api.v4.servers.adminUpdate, {
				body,
				params: {
					id: server.id,
				},
			}),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['servers'],
				exact: false,
			});
			toast.success(<Tran text="success" />, {
				description: <Tran text="server.updated" />,
			});
			form.reset({
				isDefault: data.isDefault,
				isOfficial: data.isOfficial,
				isAutoTurnOff: data.isAutoTurnOff,
				isHub: data.isHub,
				cpu: data.cpu,
				memory: data.memory,
			});
		},
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
	});

	function onSubmit(data: AdminUpdateFormValues) {
		mutate(data);
	}

	return (
		<Form {...form}>
			<form
				className={cn('flex h-full w-full flex-col gap-6 overflow-y-auto relative', {
					'pointer-events-none opacity-50': !canEdit,
				})}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormError />
				<FormField
					control={form.control}
					name="isOfficial"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.is-official" />
							</FormLabel>
							<FormControl>
								<Switch
									{...field}
									disabled={!canEdit}
									value={undefined}
									checked={field.value}
									onCheckedChange={(checked) => field.onChange(checked)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isHub"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.is-hub" />
							</FormLabel>
							<FormControl>
								<Switch
									{...field}
									disabled={!canEdit}
									value={undefined}
									checked={field.value}
									onCheckedChange={(checked) => field.onChange(checked)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isAutoTurnOff"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="server.is-auto-turn-off" />
							</FormLabel>
							<FormControl>
								<Switch
									{...field}
									disabled={!canEdit}
									value={undefined}
									checked={field.value}
									onCheckedChange={(checked) => field.onChange(checked)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{RESOURCE_FIELDS.map((config) => (
					<ResourceRangeField key={config.name} control={form.control} config={config} disabled={!canEdit} />
				))}
				<div className="flex w-full gap-2">
					<Button
						className={cn('ml-auto', {
							'opacity-0': !form.formState.isDirty,
						})}
						type="submit"
						disabled={isPending || !form.formState.isDirty || !canEdit}
					>
						{isPending ? <LoadingSpinner /> : <Tran text="update-server" />}
					</Button>
				</div>
			</form>
		</Form>
	);
}
