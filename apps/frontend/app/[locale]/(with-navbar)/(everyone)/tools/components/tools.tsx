import type { ReactNode } from 'react';
import { Divide, ImagePlus } from 'lucide-react';
import { routes } from '@/config/routes';

export const tools: {
	name: {
		text: Lowercase<string>;
		defaultValue: string;
	};
	href: string;
	icon: ReactNode;
	description: {
		text: Lowercase<string>;
		defaultValue: string;
	};
}[] = [
	{
		name: {
			text: 'ratio-calculator',
			defaultValue: 'Ratio calculator',
		},
		href: routes.tools.ratioCalculator,
		icon: <Divide />,
		description: {
			text: 'tools.ratio-calculator-description',
			defaultValue: 'Help you calculate number of blocks required for a perfects schematic',
		},
	},
	{
		name: {
			text: 'canvas-generator',
			defaultValue: 'Canvas generator',
		},
		href: routes.tools.canvasGenerator,
		icon: <ImagePlus />,
		description: {
			text: 'tools.canvas-generator-description',
			defaultValue: 'Generated canvas that display input image',
		},
	},
	{
		name: {
			text: 'logic-display-generator',
			defaultValue: 'Logic Display Generator',
		},
		href: routes.tools.logicDisplayGenerator,
		icon: <ImagePlus />,
		description: {
			text: 'tools.logic-display-generator-description',
			defaultValue: 'Generates schematic that use logic blocks and displays to show your images',
		},
	},
	{
		name: {
			text: 'sorter-generator',
			defaultValue: 'Sorter generator',
		},
		href: routes.tools.sorterGenerator,
		icon: <ImagePlus />,
		description: {
			text: 'tools.sorter-generator-description',
			defaultValue: 'Generate a pixel-art of sorters from input image',
		},
	},
];
