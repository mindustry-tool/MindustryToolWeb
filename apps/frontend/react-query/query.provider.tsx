'use client';

import type { QueryClientConfig } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ApiError } from '@mindustry-tool/api';
import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			retry(failureCount, error) {
				if (error instanceof ApiError) {
					if (error.response.status < 500) {
						return false;
					}
                    
                    if (error.response.status === 600) {
                        return false;
                    }
				}
				return failureCount < 3;
			},
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 60 * 24,
		},
	},
};

function makeQueryClient() {
	return new QueryClient(queryClientConfig);
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) {
		return makeQueryClient();
	}

	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}

export default function QueryProvider({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
