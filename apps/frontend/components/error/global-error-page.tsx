'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, Home, RefreshCw, Terminal } from 'lucide-react';
import environment from '@/config/environment';
import { routes } from '@/config/routes';

export default function GlobalErrorPage({
	error,
	onRetry,
}: {
	error: unknown;
	onRetry?: () => void;
}) {
	const [copied, setCopied] = useState(false);

	const errorMessage = error instanceof Error ? error.message : String(error ?? '');
	const errorStack = error instanceof Error ? error.stack : undefined;
	const digest =
		typeof error === 'object' && error !== null && 'digest' in error && typeof (error as { digest?: unknown }).digest === 'string'
			? (error as { digest: string }).digest
			: undefined;

	const handleCopy = async () => {
		try {
			const textToCopy = [
				digest ? `Digest: ${digest}` : '',
				errorMessage ? `Error: ${errorMessage}` : '',
				errorStack ? `Stack:\n${errorStack}` : '',
				typeof window !== 'undefined' ? `URL: ${window.location.href}` : '',
				`Time: ${new Date().toISOString()}`,
			]
				.filter(Boolean)
				.join('\n\n');

			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback silently if clipboard access is denied
		}
	};

	const handleReload = () => {
		if (onRetry) {
			onRetry();
		} else if (typeof window !== 'undefined') {
			window.location.reload();
		}
	};

	const hasDiagnostics = Boolean(errorMessage || digest || errorStack);
	const diagnosticContent = [digest ? `Digest: ${digest}` : '', errorMessage, errorStack].filter(Boolean).join('\n\n');

	return (
		<main className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-[#0D0D10] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]">
			<div className="relative z-10 w-[calc(100%-32px)] sm:w-[90%] sm:max-w-[500px] md:max-w-[520px] rounded-[16px] border border-[#27272A] bg-[#151518] p-5 sm:p-7 md:p-8 shadow-2xl">
				<div className="flex flex-col items-center text-center">
					{/* 3. Status Badge */}
					<div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wider text-amber-400 uppercase">
						<span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
						<span>ERROR 500</span>
					</div>

					{/* 4. Error Icon */}
					<div className="mt-4 flex size-[52px] items-center justify-center rounded-xl border border-amber-500/30 bg-[#221a0f] text-amber-400 shadow-inner">
						<AlertTriangle className="size-6 stroke-[2]" />
					</div>

					{/* 5. Error Title and Description */}
					<h1 className="mt-5 text-[22px] sm:text-[24px] font-bold tracking-tight text-zinc-100">
						An unexpected error occurred
					</h1>

					<p className="mt-2.5 max-w-[380px] text-[14px] leading-relaxed text-zinc-400">
						The application encountered an unexpected error. You can reload the page or return to the home screen.
					</p>

					{/* 6. Action Buttons */}
					<div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
						<button
							type="button"
							onClick={handleReload}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#6d28d9] active:scale-[0.98] cursor-pointer"
						>
							<RefreshCw className="size-4" />
							<span>Reload</span>
						</button>

						<a
							href={routes.home}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2E2E34] bg-[#1E1E22] px-5 text-sm font-medium text-zinc-200 transition-all hover:bg-[#27272D] hover:text-white active:scale-[0.98]"
						>
							<Home className="size-4" />
							<span>Home</span>
						</a>

						<a
							href={environment.url.discordServer}
							target="_blank"
							rel="noreferrer"
							className="inline-flex h-10 items-center gap-1.5 px-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
						>
							<ExternalLink className="size-3.5" />
							<span>Discord Server</span>
						</a>
					</div>
				</div>

				{/* 7. Diagnostics Section */}
				{hasDiagnostics && (
					<div className="mt-7">
						<div className="mb-5 h-[1px] w-full bg-[#27272A]" />

						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
								<Terminal className="size-3.5" />
								<span>Diagnostics</span>
							</div>

							<button
								type="button"
								onClick={handleCopy}
								className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-[#1E1E22] hover:text-zinc-200 cursor-pointer"
							>
								{copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
								<span>{copied ? 'Copied' : 'Copy stacktrace'}</span>
							</button>
						</div>

						<div className="mt-3 overflow-hidden rounded-[8px] border border-[#222226] bg-[#0B0B0E] p-3">
							{digest && (
								<div className="mb-2 text-xs font-mono text-zinc-400">
									<span className="font-semibold text-zinc-300">Digest: </span>
									<span className="select-all text-zinc-400">{digest}</span>
								</div>
							)}

							<pre className="max-h-[160px] overflow-x-auto overflow-y-auto font-mono text-[12px] sm:text-[13px] leading-relaxed text-zinc-300 whitespace-pre select-all scrollbar-thin">
								{diagnosticContent}
							</pre>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
