import type { CreateUserSchema } from '@mindustry-tool/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@mindustry-tool/api';
import { createUserSchema } from '@mindustry-tool/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageSelectForm } from '@/components/forms/image-select.form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';

export default function CreateUserForm() {
	const form = useForm({
		resolver: zodResolver(createUserSchema),
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: ['create-user'],
		mutationFn: (data: CreateUserSchema) => apiInstance.request(api.v4.users.create, { body: data }),
		onError: (error) => {
			toast.error(<Tran text="error" />, {
				description: error.message,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});

	const onSubmit = async (data: CreateUserSchema) => {
		mutate(data);
		form.reset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Tran text="username" />
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="imageUrl"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								<Tran text="avatar" />
							</FormLabel>
							<FormControl>
								<ImageSelectForm
									value={field.value}
									onChange={(value) => field.onChange(value?.url)}
									fieldState={fieldState}
									width={64}
									height={64}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isPending}>
					<Tran text="submit" />
				</Button>
			</form>
		</Form>
	);
}
