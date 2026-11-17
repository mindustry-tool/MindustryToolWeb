import { zodResolver } from '@hookform/resolvers/zod';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Suspense, useState } from 'react';

import { useForm } from 'react-hook-form';
import * as z from 'zod/v4-mini';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tran } from '@/i18n/tran';

const insertTableSchema = z.object({
	columns: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(20)),
	rows: z.coerce.number().check(z.int(), z.minimum(1), z.maximum(20)),
});

export function InsertTableDialog({ onSubmit }: { onSubmit: (props: z.infer<typeof insertTableSchema>) => void }) {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(insertTableSchema),
		defaultValues: {
			columns: 2,
			rows: 2,
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="justify-start" asChild>
				<Button variant="ghost">
					<Tran text="editor.insert-table" />
				</Button>
			</DialogTrigger>
			<Suspense>
				<DialogContent>
					<DialogTitle>
						<Tran text="editor.insert-table" />
					</DialogTitle>
					<VisuallyHidden>
						<DialogDescription></DialogDescription>
					</VisuallyHidden>
					<Form {...form}>
						<form
							className="space-y-4"
							onSubmit={form.handleSubmit((value) => {
								onSubmit(value);
								setOpen(false);
								form.reset();
							})}
						>
							<FormField
								name="columns"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="editor.rows" />
										</FormLabel>
										<FormControl>
											<Input type="number" placeholder="1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="rows"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Tran text="editor.columns" />
										</FormLabel>
										<FormControl>
											<Input type="number" placeholder="1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">
								<Tran text="editor.insert-table" />
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Suspense>
		</Dialog>
	);
}
