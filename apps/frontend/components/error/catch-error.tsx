'use client';

import dynamic from 'next/dynamic';
import environment from '@/config/environment';
import React from 'react';
import { isNextJsError, isWebGLError } from '@/lib/utils';

const ErrorMessage = dynamic(() => import('@/components/error/error-message'));
const ReportErrorDialog = dynamic(() => import('@/components/error/report-error-dialog'));
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Tran = dynamic(() => import('@/i18n/tran').then((mod) => mod.Tran), { ssr: false });
const Link = dynamic(() => import('next/link'));

type Props = {
	label?: string;
	logError?: boolean;
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

type State = (
	| {
			hasError: false;
			error?: Error;
	  }
	| {
			hasError: true;
			error: Error & { digest?: string };
	  }
) & {};

export { isWebGLError };

export class CatchError extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, info: React.ErrorInfo): void {
		try {
			this.setState({ error });

			const shouldLog = (this.props.logError ?? true) && !isWebGLError(error);
			if (shouldLog) {
				console.warn({
					[this.props.label ?? 'boundary']: JSON.stringify({
						error: String(error),
						info: String(info),
						children: String(this.props.children),
					}),
				});

				import('@sentry/nextjs')
					.then((sentry) => {
						sentry.captureException(error);
					})
					.catch(() => {});
			}
		} catch (unhandledError) {
			console.error(unhandledError);
		}
	}

	override render() {
		if (isNextJsError(this.state.error)) {
			throw this.state.error;
		}

		if (this.state.hasError) {
			if (this.props.fallback !== undefined) {
				return this.props.fallback;
			}

			return (
				<div className="flex h-full w-full flex-col items-center justify-center">
					<h1 className="text-3xl font-bold capitalize">{this.props.label ?? 'boundary'}</h1>
					<ErrorMessage className="m-0" error={this.state.error} />
					<div className="flex items-center justify-center gap-2">
						<Button>
							<ReportErrorDialog />
						</Button>
						<Button variant="outline" asChild>
							<Link href={environment.url.discordServer}>
								<Tran text="discord-server" />
							</Link>
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
