'use client';

import { Tran } from '@/i18n/tran';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Github, Copy, Check } from 'lucide-react';
import FadeInWhenVisible from './fade-in-when-visible';
import environment from '@/config/environment';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ModSection() {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(environment.url.modGithub);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error(<Tran text="error" />, {
				description: String(error),
			});
		}
	};

	return (
		<section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
			<FadeInWhenVisible>
				<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
					<div className="grid gap-8 md:grid-cols-2 md:items-center">
						<div className="space-y-6">
							<h2 className="text-3xl font-bold text-white sm:text-4xl">
								<Tran text="home.mod-title" />
							</h2>
							<p className="text-lg text-gray-300">
								<Tran
									text="home.mod-description"
								/>
							</p>
							<div className="flex flex-wrap gap-4">
								<Button asChild size="lg" className="gap-2">
									<a href={environment.url.modGithub} target="_blank" rel="noopener noreferrer">
										<Github className="h-5 w-5" />
										<Tran text="home.mod-download" />
									</a>
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="gap-2 border-white/20 hover:bg-white/10 hover:text-white"
									onClick={handleCopy}
								>
									{copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
									<Tran text="home.mod-copy-link" />
								</Button>
							</div>
						</div>
						<div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
							<Image src="/assets/images/mod-page.png" alt="Mod Preview" fill className="object-cover" />
						</div>
					</div>
					<div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
				</div>
			</FadeInWhenVisible>
		</section>
	);
}
