import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Code, Paintbrush } from 'lucide-react';
import { Tran } from '@/i18n/tran';
import FadeInWhenVisible from './fade-in-when-visible';

export default function FeaturesSection() {
	return (
		<div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
			<FadeInWhenVisible className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
				{/* Feature 1: Large Card - Storage */}
				<Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-green-500/50 md:col-span-2 md:row-span-2 hover:-translate-y-1 hover:shadow-xl duration-500">
					<div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<CardHeader>
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300 transition-colors">
							<Box className="h-6 w-6" />
						</div>
						<CardTitle className="text-2xl font-bold text-white">
							<Tran text="home.features-storage-title" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription className="text-base leading-relaxed text-gray-300">
							<Tran
								text="home.features-storage-desc"
							/>
						</CardDescription>
						{/* Abstract visual */}
						<div className="mt-8 grid grid-cols-3 gap-4 opacity-30 transition-opacity group-hover:opacity-60">
							<div className="aspect-video rounded-md bg-white/20"></div>
							<div className="aspect-video rounded-md bg-white/20"></div>
							<div className="aspect-video rounded-md bg-white/20"></div>
							<div className="aspect-video rounded-md bg-white/20"></div>
							<div className="aspect-video rounded-md bg-white/20"></div>
							<div className="aspect-video rounded-md bg-white/20"></div>
						</div>
					</CardContent>
				</Card>

				{/* Feature 2: Logic */}
				<Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-xl duration-500">
					<div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<CardHeader>
						<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
							<Code className="h-5 w-5" />
						</div>
						<CardTitle className="text-xl font-bold text-white">
							<Tran text="home.features-logic-title" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription className="text-sm leading-relaxed text-gray-300">
							<Tran
								text="home.features-logic-desc"
							/>
						</CardDescription>
					</CardContent>
				</Card>

				{/* Feature 3: Creative */}
				<Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:-translate-y-1 hover:shadow-xl duration-500">
					<div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					<CardHeader>
						<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
							<Paintbrush className="h-5 w-5" />
						</div>
						<CardTitle className="text-xl font-bold text-white">
							<Tran text="home.features-creative-title" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription className="text-sm leading-relaxed text-gray-300">
							<Tran
								text="home.features-creative-desc"
							/>
						</CardDescription>
					</CardContent>
				</Card>
			</FadeInWhenVisible>
		</div>
	);
}
