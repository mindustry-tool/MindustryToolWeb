import environment from '@/config/environment';

export const routes = mergeRoute('', {
	home: '/',
	database: createRoute('', {
		schematics: createRoute('/schematics', {
			id: ({ id }) => `/${id}`,
		}),
		maps: createRoute('/maps', {
			id: ({ id }) => `/${id}`,
		}),
		mods: createRoute('/mods', {
			id: ({ id }) => `/${id}`,
		}),
		contentPatches: createRoute('/content-patches', {
			id: ({ id }) => `/${id}`,
		}),
	}),
	tools: createRoute('/tools', {
		ratioCalculator: 'https://mindustry-calculator.vercel.app/?item=surge-alloy:b:1',
		logicDisplayGenerator: '/logic-display-generator',
		sorterGenerator: '/sorter-generator',
		canvasGenerator: '/canvas-generator',
		modEditor: 'https://project-editor.smme.workers.dev/en/projects',
	}),
	about: '/about',
	donate: '/donate',
	wiki: createRoute('/wiki', {
		postId: ({ id, path }) => `/${id}?path=${path}`,
	}),
	posts: createRoute('/posts', {
		id: ({ id }) => `/${id}`,
	}),
	newPost: '/new-post',
	communityServers: '/community-servers',
	servers: createRoute('/servers', {
		id: ({ id }) =>
			createRoute(`/${id}`, {
				maps: '/maps',
				mods: '/mods',
				credit: '/credit',
				players: '/players',
			}),
	}),
	serverGroups: createRoute('/server-groups', {
		id: ({ id }) =>
			createRoute(`/${id}`, {
				admins: '/admins',
				envs: '/envs',
				webhooks: '/webhooks',
			}),
	}),
	serverManagers: createRoute('/server-managers', {
		id: ({ id }) => `/${id}`,
		create: '?create=true',
	}),
	users: createRoute('/users', {
		id: ({ id }) => `/${id}`,
	}),
	playerConnects: '/player-connects',
	chat: '/chat',

	crashes: '/crashes',
	bugReport: 'https://yourchoice.smme.workers.dev/projects/cmm8tccmc0001vlucyj8bn6s1',
	help: '/help',
	notification: '/notifications',
	settings: '/@me',
	management: createRoute('/management', {
		schematics: createRoute('/schematics', {
			id: ({ id }) => `/${id}`,
		}),
		maps: createRoute('/maps', {
			id: ({ id }) => `/${id}`,
		}),
		contentPatches: createRoute('/content-patches', {
			id: ({ id }) => `/${id}`,
		}),
		users: '/users',
		roles: '/roles',
		notifications: '/notifications',
	}),
	data: createRoute('/data', {
		wiki: '/wiki',
		githubUploads: '/github-uploads',
		icon: '/icons',
		tags: '/tags',
		image: '/images',
		apiDocs: `${environment.url.apiV4}/api-docs`,
		rabbitmq: 'http://analytic.mindustry-tool.com:15672',
	}),
	moderation: createRoute('/moderation', {
		actions: '/actions',
		reports: '/reports',
		media: '/media',
		comments: '/comments',
	}),
	me: createRoute('/@me', {
		servers: '/servers',
	}),
} as const);

type RouteParam<T extends string> = Record<T, string | number>;

type Route<
	T extends string,
	P extends string,
	R extends string | ((value: RouteParam<P>) => string | Route<any, any, any>) | Route<any, any, any>,
> = {
	value: string;
} & {
	[key in T]: R;
};

function createRoute<
	K extends string,
	P extends string,
	T extends string | ((value: RouteParam<P>) => string | Route<any, any, any>) | Route<any, any, any>,
	S extends Record<K, T>,
>(segment: string, subs: S) {
	return {
		value: segment,
		...subs,
	};
}

function mergeRoute<
	K extends string,
	P extends string,
	T extends string | ((value: RouteParam<P>) => string | Route<any, any, any>) | Route<any, any, any>,
	S extends Record<K, T>,
>(segment: string, subs: S) {
	const route = { value: segment } as Route<K, P, T> & S;

	function isRouteObject(v: unknown): v is { value: string } {
		return !!v && typeof v === 'object' && 'value' in v;
	}

	const merge = Object.fromEntries(
		Object.entries(subs).map(([key, value]) => {
			if (!value) throw new Error('Invalid route');

			// Dynamic segment: wrap and prefix result
			if (typeof value === 'function') {
				return [
					key,
					(params: RouteParam<P>) => {
						const res = (value as (v: RouteParam<P>) => string | Route<any, any, any>)(params);

						if (typeof res === 'string') {
							return segment + res;
						}

						if (isRouteObject(res)) {
							// Prefix returned route with current segment and drop child.value from subs
							const { value: childValue, ...childS } = res as { value: string } & Record<string, any>;

							return mergeRoute(segment + childValue, childS);
						}

						throw new TypeError('Invalid dynamic route return');
					},
				];
			}

			// Nested route object: prefix with current segment
			if (typeof value === 'object') {
				if (isRouteObject(value)) {
					const { value: childValue, ...childS } = value as { value: string } & Record<string, any>;
					return [key, mergeRoute(segment + childValue, childS)];
				}
				throw new TypeError('Invalid nested route object');
			}

			// Static string segment
			if (typeof value !== 'string') {
				throw new TypeError(`Invalid route value: ${value}`);
			}

			if (value.startsWith('http')) {
				return [key, value];
			}

			return [key, segment + value];
		}),
	);

	Object.assign(route, merge);

	return route;
}
