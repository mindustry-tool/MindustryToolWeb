'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tran } from '@/i18n/tran';
import { useI18n } from '@/i18n/i18n.client';

export default function AIImageStudio() {
	const { t } = useI18n('image');
	const [model, setModel] = useState('Stable Diffusion XL');
	const [aspect, setAspect] = useState('1:1');
	const [resolution, setResolution] = useState(768);
	const [guidance, setGuidance] = useState(7);
	const [steps, setSteps] = useState(30);

	const models = [
		{ name: 'Stable Diffusion XL', tag: 'photoreal | open' },
		{ name: 'SDXL Turbo', tag: 'fast | creative' },
		{ name: 'DALL·E 3', tag: 'coherent | premium' },
		{ name: 'FLUX.1', tag: 'style | vivid' },
	];

	const aspects = ['1:1', '3:4', '4:3', '16:9'];

	const styles = [
		'Cinematic',
		'Analog film',
		'Neon noir',
		'Watercolor',
		'Studio lighting',
		'Isometric',
		'3D render',
		'Fantasy art',
	];

	const variants = [
		{
			name: 'Purple Pink',
			gradient: 'from-purple-500 via-pink-500 to-red-500',
			glow: 'rgba(236,72,153,0.7)',
		},
		{
			name: 'Cyan Blue',
			gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
			glow: 'rgba(56,189,248,0.7)',
		},
		{
			name: 'Emerald Lime',
			gradient: 'from-green-400 via-emerald-500 to-lime-400',
			glow: 'rgba(34,197,94,0.7)',
		},
		{
			name: 'Amber Orange',
			gradient: 'from-amber-400 via-orange-500 to-red-500',
			glow: 'rgba(251,146,60,0.7)',
		},
		{
			name: 'Rainbow',
			gradient: 'from-pink-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600',
			glow: 'rgba(168,85,247,0.7)',
		},
	];

	return (
		<div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-black via-zinc-950 to-purple-950 p-6 text-white">
			{variants.map((v, i) => (
				<button
					key={i}
					className={`relative rounded-2xl bg-linear-to-r px-8 py-3 font-semibold 
          text-white ${v.gradient}
          animate-gradient-x border
          border-white/20 bg-size-[200%_200%] backdrop-blur-lg
          transition-all duration-300 
          hover:scale-105`}
					style={{
						boxShadow: `0 0 25px ${v.glow}, 0 0 50px ${v.glow}`,
					}}
				>
					{v.name}
					{/* Glass reflection */}
					<span className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-t from-white/30 to-transparent opacity-30"></span>
				</button>
			))}
			<Card className="w-full max-w-6xl rounded-2xl border-zinc-800 bg-zinc-900/90 shadow-xl">
				<CardContent className="grid grid-cols-12 gap-6 p-6">
					{/* Models */}
					<div className="col-span-3 space-y-4">
						<h2 className="mb-2 text-lg font-semibold"><Tran text="image.model" /></h2>
						{models.map((m) => (
							<Button
								key={m.name}
								variant={model === m.name ? 'secondary' : 'outline'}
								className="w-full justify-between"
								onClick={() => setModel(m.name)}
							>
								{m.name}
								<span className="ml-2 text-xs text-zinc-400">{m.tag}</span>
							</Button>
						))}

						{/* Settings */}
						<h2 className="mt-6 text-lg font-semibold"><Tran text="image.settings" /></h2>
						<div className="space-y-4">
							{/* Aspect ratio */}
							<div>
								<p className="mb-2 text-sm"><Tran text="image.aspect-ratio" /></p>
								<div className="flex gap-2">
									{aspects.map((a) => (
										<Button
											key={a}
											variant={aspect === a ? 'secondary' : 'outline'}
											size="sm"
											onClick={() => setAspect(a)}
										>
											{a}
										</Button>
									))}
								</div>
							</div>

							{/* Resolution */}
							<div>
								<p className="mb-2 text-sm">
									<Tran text="image.resolution" /> ({resolution}
									px)
								</p>
								<Slider value={[resolution]} onValueChange={(val) => setResolution(val[0]!)} min={256} max={1024} />
							</div>

							{/* Guidance */}
							<div>
								<p className="mb-2 text-sm">
									<Tran text="image.guidance" />
									{guidance}
								</p>
								<Slider value={[guidance]} onValueChange={(val) => setGuidance(val[0]!)} min={1} max={20} />
							</div>

							{/* Steps */}
							<div>
								<p className="mb-2 text-sm">
									<Tran text="image.steps" />
									{steps}
								</p>
								<Slider value={[steps]} onValueChange={(val) => setSteps(val[0]!)} min={1} max={100} />
							</div>
						</div>
					</div>

					{/* Prompt */}
					<div className="col-span-9 space-y-4">
						<h2 className="text-lg font-semibold"><Tran text="image.prompt" /></h2>
						<Input placeholder={t('image.prompt-placeholder')} className="border-zinc-700 bg-zinc-800" />

						<div className="flex flex-wrap gap-2">
							{styles.map((s) => (
								<Button key={s} variant="outline" size="sm">
									{s}
								</Button>
							))}
						</div>

						<div className="pt-4">
							<Button className="bg-indigo-600 hover:bg-indigo-700"><Tran text="generate" /></Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
