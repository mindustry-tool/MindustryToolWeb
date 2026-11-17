'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
	Check,
	Coffee,
	Copy,
	Database,
	ExternalLink,
	Globe,
	HardDrive,
	Heart,
	Landmark,
	Server,
	Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

import ScrollContainer from '@/components/common/scroll-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n.client';
import { Tran } from '@/i18n/tran';

const reasons = [
	{
		key: 'donate.reason-servers',
		defaultValue: 'Server and hosting costs',
		icon: Server,
	},
	{
		key: 'donate.reason-database',
		defaultValue: 'Database and storage',
		icon: Database,
	},
	{
		key: 'donate.reason-infrastructure',
		defaultValue: 'Backups and infrastructure',
		icon: HardDrive,
	},
	{
		key: 'donate.reason-development',
		defaultValue: 'Development and maintenance',
		icon: Wrench,
	},
] as const;

function CopyButton({ text, label }: { text: string; label?: string }) {
	const [copied, setCopied] = useState(false);
	const { t } = useI18n('donate');

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!text) return;
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success(t('copied-to-clipboard', { label: label || 'value' }));
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			title={t('copy-label', { label: label || '' })}
			aria-label={t('copy-label', { label: label || '' })}
		>
			{copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
		</button>
	);
}

export default function DonationPage() {
	return (
		<ScrollContainer className="p-4 sm:p-6 lg:p-8">
			<div className="mx-auto w-full max-w-5xl space-y-8">
				{/* Page Header */}
				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
						<Tran text="donate.title" />
					</h1>
					<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						<Tran text="donate.sub" />
					</p>
				</div>

				{/* Donation Methods */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold tracking-tight">
						<Tran text="donate.methods-title" />
					</h2>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{/* Agribank Method */}
						<Card className="flex flex-col justify-between h-full">
							<CardHeader className="space-y-1.5 pb-4">
								<div className="flex items-center justify-between gap-2">
									<CardTitle className="flex items-center gap-2 text-base font-semibold">
										<Landmark className="size-4 text-muted-foreground" />
										<Tran text="donate.agribank" />
									</CardTitle>
								</div>
								<Badge variant="secondary" className="text-xs font-normal">
									<Tran text="donate.agribank-subtitle" />
								</Badge>
								<CardDescription className="text-xs">
									<Tran text="donate.agribank-note" />
								</CardDescription>
							</CardHeader>

							<CardContent className="flex flex-1 flex-col justify-between space-y-4">
								<div className="relative mx-auto aspect-992/1859 w-full max-w-55 overflow-hidden rounded-md border bg-white shadow-xs">
									<Image
										src="/assets/images/agribank.jpg"
										alt="Agribank transfer QR code and account details"
										fill
										sizes="(max-width: 768px) 220px, 220px"
										className="object-contain"
									/>
								</div>

								<div className="space-y-2 rounded-md bg-muted/40 p-3 text-xs">
									<div className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground">
											<Tran text="donate.agribank-account-number" />
										</span>
										<div className="flex items-center gap-1 font-mono font-medium">
											<span>8888329239577</span>
											<CopyButton text="8888329239577" label="account number" />
										</div>
									</div>
									<div className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground">
											<Tran text="donate.agribank-account-name" />
										</span>
										<div className="flex items-center gap-1 font-medium">
											<span>NGUYEN NHON HAU</span>
											<CopyButton text="NGUYEN NHON HAU" label="account name" />
										</div>
									</div>
									<div className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground">
											<Tran text="donate.agribank-bank-name" />
										</span>
										<span className="font-medium">Agribank</span>
									</div>
								</div>
							</CardContent>
						</Card>
						{/* PayPal Method */}
						<Card className="flex flex-col justify-between h-full">
							<CardHeader className="space-y-1.5 pb-4">
								<div className="flex items-center justify-between gap-2">
									<CardTitle className="flex items-center gap-2 text-base font-semibold">
										<Globe className="size-4 text-muted-foreground" />
										<Tran text="donate.paypal" />
									</CardTitle>
								</div>
								<Badge variant="secondary" className="text-xs font-normal">
									<Tran text="donate.paypal-subtitle" />
								</Badge>
								<CardDescription className="text-xs">
									<Tran text="donate.paypal-note" />
								</CardDescription>
							</CardHeader>

							<CardContent className="flex flex-1 flex-col justify-between space-y-4">
								<div className="relative mx-auto aspect-992/1859 w-full max-w-55 overflow-hidden rounded-md border bg-white shadow-xs">
									<Image
										src="/assets/images/paypal.jpg"
										alt="PayPal QR code and payment details"
										fill
										sizes="(max-width: 768px) 220px, 220px"
										className="object-contain"
									/>
								</div>

								<div className="space-y-2 rounded-md bg-muted/40 p-3 text-xs">
									<div className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground">
											<Tran text="donate.paypal-recipient" />
										</span>
										<div className="flex items-center gap-1 font-medium">
											<span>Hau Nguyen</span>
											<CopyButton text="Hau Nguyen" label="recipient" />
										</div>
									</div>
									<div className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground shrink-0">
											<Tran text="donate.paypal-email" />
										</span>
										<div className="flex min-w-0 items-center gap-1 font-mono font-medium">
											<span className="truncate text-right" title="nguyennhonhau25052003@gmail.com">
												nguyennhonhau25052003@gmail.com
											</span>
											<CopyButton text="nguyennhonhau25052003@gmail.com" label="email" />
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Buy Me a Coffee Method */}
						<Card className="flex flex-col justify-between h-full md:col-span-2 md:max-w-md md:mx-auto lg:col-span-1 lg:max-w-none w-full">
							<CardHeader className="space-y-1.5 pb-4">
								<div className="flex items-center justify-between gap-2">
									<CardTitle className="flex items-center gap-2 text-base font-semibold">
										<Coffee className="size-4 text-muted-foreground" />
										<Tran text="donate.buymeacoffee" />
									</CardTitle>
								</div>
								<Badge variant="secondary" className="text-xs font-normal">
									<Tran text="donate.buymeacoffee-subtitle" />
								</Badge>
								<CardDescription className="text-xs">
									<Tran text="donate.buymeacoffee-note" />
								</CardDescription>
							</CardHeader>

							<CardContent className="flex flex-1 flex-col justify-between space-y-4">
								<div className="relative mx-auto aspect-992/1859 w-full max-w-55 overflow-hidden rounded-md border bg-white shadow-xs">
									<Image
										src="/assets/images/buymeacoffee.svg"
										alt="Buy Me a Coffee QR code and profile link"
										fill
										unoptimized
										sizes="(max-width: 768px) 220px, 220px"
										className="object-contain"
									/>
								</div>

								<div className="space-y-4">
									<div className="space-y-2 rounded-md bg-muted/40 p-3 text-xs">
										<div className="flex items-center justify-between gap-2">
											<span className="text-muted-foreground">
												<Tran text="donate.buymeacoffee-recipient" />
											</span>
											<div className="flex items-center gap-1 font-medium">
												<span>Nguyen Nhon Hau</span>
												<CopyButton text="Nguyen Nhon Hau" label="recipient" />
											</div>
										</div>
										<div className="flex items-center justify-between gap-2">
											<span className="text-muted-foreground">
												<Tran text="donate.buymeacoffee-page" />
											</span>
											<div className="flex items-center gap-1 font-mono font-medium">
												<span>@nguyennhonh</span>
												<CopyButton text="https://buymeacoffee.com/nguyennhonh" label="link" />
											</div>
										</div>
									</div>

									<Button asChild className="w-full gap-2 text-xs" variant="default">
										<a href="https://buymeacoffee.com/nguyennhonh" target="_blank" rel="noopener noreferrer">
											<Coffee className="size-3.5" />
											<span>
												<Tran text="donate.buymeacoffee-button" />
											</span>
											<ExternalLink className="size-3.5 opacity-70" />
										</a>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Where donations go */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold tracking-tight">
						<Tran text="donate.why-title" />
					</h2>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{reasons.map((reason) => {
							const Icon = reason.icon;
							return (
								<div
									key={reason.key}
									className="flex items-center gap-3 rounded-lg border bg-card/60 p-3 text-sm text-foreground shadow-2xs"
								>
									<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
										<Icon className="size-4" />
									</div>
									<span>
										<Tran text={reason.key} />
									</span>
								</div>
							);
						})}
					</div>
				</section>

				{/* Closing Message */}
				<div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
					<Heart className="mt-0.5 size-4 shrink-0 text-rose-400" />
					<p className="leading-relaxed">
						<Tran text="donate.thanks" />
					</p>
				</div>
			</div>
		</ScrollContainer>
	);
}
