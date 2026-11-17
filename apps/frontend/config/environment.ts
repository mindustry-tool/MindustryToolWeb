const environment = {
	webVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'v1.0.0',
	webName: 'Mindustry Tool',
	imageFormat: '.png',
	url: {
		socket: process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL || 'wss://api.mindustry-tool.com',
		base: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://mindustry-tool.com',
		api: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.mindustry-tool.com',
		apiV4: process.env.NEXT_PUBLIC_BACKEND_V4_URL || 'https://api.mindustry-tool.com/api/v4',
		image: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_URL || 'https://api.mindustry-tool.com/static',
		bot: 'https://discord.com/oauth2/authorize?client_id=918818673626599434',
		discordServer: 'https://discord.gg/DmjdPCeWPY',
		vnDiscordServer: 'https://discord.gg/ysNzQv8AXr',
		github: 'https://github.com/MindustryVN',
		modGithub: 'https://github.com/MindustryVN/MindustryToolMod',
	},
	supportedImageFormat: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
	adUnit: {
		rewarded: process.env.NEXT_PUBLIC_GPT_REWARDED_AD_UNIT || '/22639388115/rewarded_web_example',
	},
} as const;

export const SHOW_TAG_NAME_PERSISTENT_KEY = 'show-tag-name';
export const SHOW_TAG_NUMBER_PERSISTENT_KEY = 'show-tag-number';
export const MID_COOKIE_NAME = 'mid';
export const EMPTY_IMAGE_URL =
	'https://raw.githubusercontent.com/Anuken/Mindustry/master/core/assets-raw/sprites/ui/nomap.png';

export default environment;
