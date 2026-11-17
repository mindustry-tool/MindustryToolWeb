import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import environment from '@/config/environment';
import { Tran } from '@/i18n/tran';

export default function LogoutButton() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="ml-auto" variant="ghost" size="icon">
					<LogOut />
				</Button>
			</AlertDialogTrigger>
			<Suspense>
				<AlertDialogContent>
					<AlertDialogTitle>
						<Tran text="logout.title" />
					</AlertDialogTitle>
					<AlertDialogDescription>
						<Tran text="logout.confirm" />
					</AlertDialogDescription>
					<AlertDialogAction asChild>
						<Link href={`${environment.url.apiV4}/auth/logout`}>
							<Tran text="logout" />
						</Link>
					</AlertDialogAction>
					<AlertDialogCancel>
						<Tran text="cancel" />
					</AlertDialogCancel>
				</AlertDialogContent>
			</Suspense>
		</AlertDialog>
	);
}
