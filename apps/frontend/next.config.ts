import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';

import withBundleAnalyzer from '@next/bundle-analyzer';

const now = new Date();

const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
}).formatToParts(now);

const values = Object.fromEntries(parts.map(p => [p.type, p.value]));

const year = values.year;
const month = values.month;
const day = values.day;
const hour = values.hour;
const minute = values.minute;

const buildVersion = `v${Number(year) - 2000}.${month}.${day}.${hour}.${minute}`;

const nextConfig: NextConfig = {
	// Configure for monorepo setup
	reactCompiler: true,

	env: { NEXT_PUBLIC_BUILD_VERSION: buildVersion },
	turbopack: {
		// Add turbo configuration for monorepo
		// resolveAlias removed; rely on workspace package resolution
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	productionBrowserSourceMaps: false,
	pageExtensions: ['ts', 'tsx'],
	crossOrigin: 'anonymous',
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8080',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.discordapp.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'api.mindustry-tool.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'image.mindustry-tool.com',
				pathname: '/**',
			},
            {
				protocol: 'https',
				hostname: 'content.mindustry-tool.com',
				pathname: '/**',
			},
			{
				hostname: 'blob:mindustry-tool.com',
				pathname: '/**',
			},
			{
				hostname: 'blob:localhost',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'raw.githubusercontent.com',
				pathname: '/**',
			},
		],
	},
	// Ensure proper module resolution
	// webpack: (config, { isServer }) => {
	// 	// Handle workspace packages
	// 	config.resolve.alias = {
	// 		...config.resolve.alias,
	// 		'@mindustry-tool/api': path.resolve(__dirname, '../../packages/api'),
	// 	};

	// 	return config;
	// },
	redirects() {
		return [
			{
				source: '/:locale/upload/map',
				destination: '/maps?upload=true',
				permanent: true,
			},
			{
				source: '/:locale/upload/schematic',
				destination: '/schematics?upload=true',
				permanent: true,
			},
		];
	},
};

const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
	openAnalyzer: false,
});

export default process.env.SENTRY_AUTH_TOKEN
	? withSentryConfig(bundleAnalyzer(nextConfig), {
			org: 'mindustrytool',
			project: 'mindustry-tool',
			silent: true,
			widenClientFileUpload: true,
			disableLogger: true,
			automaticVercelMonitors: true,
	  })
	: bundleAnalyzer(nextConfig);
