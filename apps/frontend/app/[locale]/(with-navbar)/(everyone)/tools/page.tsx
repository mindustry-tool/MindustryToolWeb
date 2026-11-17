import { tools } from '@/app/[locale]/(with-navbar)/(everyone)/tools/components/tools';
import { LocalLink } from '@/components/common/locale-link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tran } from '@/i18n/tran';

export default function Page() {
	return (
		<main className="grid gap-1 lg:grid-cols-[repeat(auto-fit,minmax(360px,1fr))]">
			{tools.map(({ name, href, icon, description }, index) => (
				<LocalLink className="group relative h-32 p-1 transition-all hover:-translate-y-2" key={index} href={href}>
					<div
						className="absolute -inset-0.5 rounded-lg opacity-0 blur transition-all duration-1000 group-hover:opacity-100 group-hover:duration-200"
						style={{
							backgroundImage:
								'linear-gradient(to right, oklch(0.7 0.3 0) 0%, oklch(0.7 0.3 270) 50%, oklch(0.7 0.3 180) 100%)',
							backgroundSize: '200% auto',
							animationName: 'gradient-x',
							animationDuration: '3s',
							animationTimingFunction: 'linear',
							animationIterationCount: 'infinite',
						}}
					></div>
					<Card className="relative h-full bg-card/80">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{icon}
								<Tran {...name} />
							</CardTitle>
							<CardDescription>
								<Tran className="line-clamp-3 text-ellipsis" {...description} />
							</CardDescription>
						</CardHeader>
					</Card>
				</LocalLink>
			))}
		</main>
	);
}
