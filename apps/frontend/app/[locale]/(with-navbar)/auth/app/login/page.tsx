'use client';

import LoginButton from '@/components/buttons/login-button';
import { MutateButton } from '@/components/buttons/mutate-button';
import ClientProtectedElement from '@/components/layout/client-protected-element';
import { apiInstance } from '@/config/api';
import { Tran } from '@/i18n/tran';
import { api } from '@mindustry-tool/api';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

const LOGIN_QUERY_KEY = ['login'];
const EMPTY_MUTATION_KEY: string[] = [];

export default function Page() {
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<Suspense>
				<ClientProtectedElement filter alt={<LoginButton />}>
					<Client />
				</ClientProtectedElement>
			</Suspense>
		</div>
	);
}

function Client() {
	const [loginId, setLoginId] = useQueryState('loginId');

	if (!loginId) {
		return (
			<Tran className="text-destructive font-semibold" text="login.bad-login-link" />
		);
	}

	if (loginId === 'success') {
		return (
			<Tran
				className="text-success font-semibold"
				text="login.login-success"
			/>
		);
	}

	return (
		<>
			<Tran className="font-semibold" text="login.login-to-mindustry" />
			<MutateButton
				queryKey={LOGIN_QUERY_KEY}
				mutationKey={EMPTY_MUTATION_KEY}
				mutationFn={() =>
					apiInstance.request(api.v4.auth.app.login, {
						body: {
							loginId,
						},
					})
				}
				on={{
					onSettled: () => {
						setLoginId('success');
					},
				}}
			>
				<Tran text="login" />
			</MutateButton>
		</>
	);
}
