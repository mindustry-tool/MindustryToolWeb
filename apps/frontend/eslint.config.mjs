import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { plugin as shadcn } from '@shadcn/lint';
import unusedImports from 'eslint-plugin-unused-imports';
import tailwindCanonicalClasses from 'eslint-plugin-tailwind-canonical-classes';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	...tailwindCanonicalClasses.configs['flat/recommended'],
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		// Generated / shadcn components (linted internally by the design system):
		'components/ui/**',
		'components/tiptap/**',
		// Build outputs and caches:
		'dist/**',
		'.vinext/**',
		'.turbo/**',
		'.wrangler/**',
		'node_modules',
		'analyze',
	]),
	{
		plugins: {
			'unused-imports': unusedImports,
			shadcn,
		},
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			'tailwind-canonical-classes/tailwind-canonical-classes': [
				'warn',
				{
					cssPath: './app/globals.css',
					calleeFunctions: ['cn', 'clsx', 'cva'],
				},
			],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	// @shadcn/lint rules
	{
		rules: {
			// Prevent overriding component styles — allow layout utilities (flex, grid, margin, gap)
			// 'shadcn/no-restyle': ['warn', { allow: ['layout'] }],
			// Enforce theme color tokens over raw palette colors (e.g. bg-zinc-100)
			// 'shadcn/no-raw-colors': 'warn',
			// Require theme scale values instead of arbitrary values like p-[13px]
			// 'shadcn/no-arbitrary-values': 'warn',
			// Catch typos and invalid Tailwind classes (e.g. hovr:flex, rounded-huge)
			'shadcn/no-unknown-classes': [
				'warn',
				{
					allow: [
						// Library classes (xyflow, react-flow)
						'nodrag',
						'nopan',
						'nowheel',
						'react-flow__canvas',
						// Typography plugin
						'not-prose',
						// Custom utilities and animation classes
						'scrollbar-hide',
						'scroll-container',
						'arrow-selector',
						'animate-appear',
						'animate-float-hero',
						'animate-float-card-left',
						'animate-float-card-right',
						'blur-text',
						'drag-active',
						'drag-over',
						'overscroll-behavior-contain',
					],
				},
			],
		},
	},
]);

export default eslintConfig;
