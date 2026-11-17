'use client';

import ColorText from '@/components/common/color-text';
import ErrorMessage from '@/components/error/error-message';
import LoadingSpinner from '@/components/spinner/loading-spinner';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { ApiError } from '@mindustry-tool/api';
import { ApiResult } from '@mindustry-tool/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { use } from 'react';

export default function Page({ params }: PageProps<'/[locale]/login/[token]'>) {
	const { token } = use(params);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['login-tokens', token],
		queryFn: async () =>
			apiInstance.request(api.v4.servers.loginToken, {
				params: {
					token,
				},
			}),
	});

	if (isError) {
		if (error && error instanceof ApiError && error.response.status === 404) {
			return <span><Tran text="login.token-expired" /></span>;
		}

		return <ErrorMessage error={error} />;
	}

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!data) {
		return <span><Tran text="login.token-invalid" /></span>;
	}

	return (
		<div className="flex items-center justify-center w-full h-full">
			<VerifyTokenButton token={token} data={data} />
		</div>
	);
}

function VerifyTokenButton({ token, data }: { token: string; data: ApiResult<typeof api.v4.servers.loginToken> }) {
	const { uuid, ip, name } = data;

	const { mutate, isError, error, isPending, isIdle } = useMutation({
		mutationFn: async () =>
			apiInstance.request(api.v4.servers.verifyLogin, {
				params: {
					token,
				},
			}),
	});

	if (isPending) {
		return <LoadingSpinner />;
	}

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	if (isIdle) {
		return (
			<div className="grid gap-1 items-center justify-center m-auto">
				<Tran
					className="text-foreground"
					text="server.login-info"
				/>
				<div>
					<p className="font-semibold">
						<Tran text="login.name" /> <ColorText text={name} />
					</p>
					<p className="text-muted-foreground">{`UUID: ${uuid}`}</p>
					<p className="text-muted-foreground">{`IP: ${ip}`}</p>
				</div>
				<Button onClick={() => mutate()}><Tran text="login.login-btn" /></Button>
			</div>
		);
	}

	return (
		<div>
			<Tran
				className="text-success text-xl"
				text="server.login-success"
			/>
		</div>
	);
}
