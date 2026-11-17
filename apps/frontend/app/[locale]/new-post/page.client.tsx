'use client';

import { api } from '@mindustry-tool/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LocalLink } from '@/components/common/locale-link';
import NotFoundCard from '@/components/common/not-found-card';
import ErrorMessage from '@/components/error/error-message';
import ProtectedRoute from '@/components/layout/protected-route';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiInstance } from '@/config/api';
import { routes } from '@/config/routes';
import { Tran } from '@/i18n/tran';
import { useSearchParams } from 'next/navigation';

const SimpleEditor = dynamic(() => import('@/components/post/simple-editor'), {
	ssr: false,
	loading: () => (
		<>
			<div className="grid grid-cols-3 px-2 mx-auto mt-2 w-full">
				<Button variant="secondary" asChild>
					<LocalLink className="w-fit" href={routes.posts.value}>
						<ArrowLeft size={8} />
						<Tran text="back" />
					</LocalLink>
				</Button>
				<Tabs>
					<TabsList className="mx-auto">
						<TabsTrigger value="title"><Tran text="title" /></TabsTrigger>
						<TabsTrigger value="content"><Tran text="content" /></TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<Skeleton className="h-full w-full" />
		</>
	),
});

export function PageClient() {
	const searchParams = useSearchParams();
	const postId = searchParams.get('edit');

	return (
		<div className="h-full w-full overflow-hidden">
			<ProtectedRoute filter>
				<Suspense>{postId ? <EditForm postId={postId} /> : <CreateForm />}</Suspense>
			</ProtectedRoute>
		</div>
	);
}

function CreateForm() {
	return <SimpleEditor />;
}

function EditForm({ postId }: { postId: string }) {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['posts', postId],
		queryFn: () =>
			apiInstance.request(api.v4.posts.getById, {
				params: { id: postId },
			}),
	});

	if (isLoading) {
		return <LoadingSpinner className="m-auto" />;
	}

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	if (!data) {
		return <NotFoundCard />;
	}

	return <SimpleEditor edit={data} />;
}
