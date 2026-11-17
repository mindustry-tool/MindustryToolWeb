export const NAME_REGEX = /^[a-z0-9-]+$/;
export const MAX_MESSAGE_LENGTH = 1000;
export const DEFAULT_PAGINATION_SIZE = 10;
export const SHARE_QUERY_NAME = 'si';

export const SORT_TAGS = ['time_desc', 'time_asc', 'like_desc', 'download-count_desc'] as const;
export type SortTag = (typeof SORT_TAGS)[number];
export const DEFAULT_SORT_TAG: SortTag = 'time_desc';

export const COMMENT_SORTS = ['newest', 'oldest'] as const;
export type CommentSort = (typeof COMMENT_SORTS)[number];

export const LOCALES = ['en', 'vi', 'kr', 'cn', 'jp', 'ru', 'ua', 'fr', 'de', 'id', 'be'] as const;
export type Locale = (typeof LOCALES)[number];

export const FLAG_MAP: Record<Locale, string> = {
  cn: '🇨🇳', // China
  en: '🇬🇧', // United Kingdom (common for English)
  vi: '🇻🇳', // Vietnam
  kr: '🇰🇷', // South Korea
  jp: '🇯🇵', // Japan
  ru: '🇷🇺', // Russia
  ua: '🇺🇦', // Ukraine
  fr: '🇫🇷', // France
  de: '🇩🇪', // Germany
  id: '🇮🇩', // Indonesia
  be: '🇧🇾', // Belarus
};

export const SERVER_MODES = ['SURVIVAL', 'SANDBOX', 'ATTACK', 'PVP'] as const;
export type ServerMode = (typeof SERVER_MODES)[number];

export const I18N_CACHE_PREFIX = 'I18N-';

export const POST_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'] as const;

export const SEARCH_VERIFICATION_STATUSES = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const;
export type SearchVerificationStatus = (typeof SEARCH_VERIFICATION_STATUSES)[number];

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ITEM_TYPES = ['schematics', 'maps', 'posts', 'content-patches'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const FRIEND_STATUS = ['PENDING', 'ACCEPTED', 'BLOCK', 'REJECTED'] as const;
export type FriendStatus = (typeof FRIEND_STATUS)[number];

export const SERVER_STATUSES = [
  'ONLINE',
  'PAUSED',
  'DISCONNECT',
  'STOP',
  'UNKNOWN',
  'NOT_RESPONSE',
  'UNSET',
  'OFFLINE',
] as const;

export type ServerStatus = (typeof SERVER_STATUSES)[number];

export const SERVER_STATUS_MAP = {
  ONLINE: 0,
  PAUSED: 1,
  DISCONNECT: 2,
  STOP: 3,
  UNKNOWN: 4,
  NOT_RESPONSE: 5,
  UNSET: 6,
  OFFLINE: 7,
} as const satisfies Record<ServerStatus, number>;

export type ServerImageConfig = {
  name: string;
  image: string;
  gameVersion: number;
};

export const SERVER_IMAGES: ServerImageConfig[] = [
  {
    name: 'v8 build 160',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b160',
    gameVersion: 160,
  },
  {
    name: 'graalvm v8 build 160',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:graalvm-v8b160',
    gameVersion: 160,
  },
  {
    name: 'v8 build 159',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b159',
    gameVersion: 159,
  },
  {
    name: 'v8 build 158',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b158',
    gameVersion: 158,
  },
  {
    name: 'v8 build 157 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b157',
    gameVersion: 157,
  },
  {
    name: 'v8 build 156 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b156',
    gameVersion: 156,
  },
  {
    name: 'v8 build 155 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b155',
    gameVersion: 155,
  },
  {
    name: 'v8 build 154.2 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b154.2',
    gameVersion: 154,
  },
  {
    name: 'v8 build 153 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b153',
    gameVersion: 153,
  },
  {
    name: 'v8 build 152.2 (beta)',
    image: 'ghcr.io/mindustrytool/mindustry-server-image:v8b152.2',
    gameVersion: 152,
  },
];

export const SERVER_GAMEMODES = ['ziger', 'towerdefense', 'catali', 'flood', 'hex'] as const;

export const REDIRECT_COOKIE_NAME = 'redirect';

export const DEfAULT_I18N_NAMESPACE: string = 'common';
export const DEfAULT_LOCALE: Locale = 'en';
export const I18N_COOKIE_NAME = 'locale';

export type TranslateFunction = (key: string, args?: Record<string, string | number>) => string;

const ARC_COLOR_ENTRIES: Array<readonly [upper: string, value: string]> = [
  ['CLEAR', '#00000000'],
  ['BLACK', '#000000'],
  ['WHITE', '#ffffff'],
  ['LIGHT_GRAY', '#bfbfbfff'],
  ['GRAY', '#7f7f7fff'],
  ['DARK_GRAY', '#3f3f3fff'],
  ['LIGHT_GREY', '#d3d3d3'],
  ['GREY', '#7f7f7fff'],
  ['DARK_GREY', '#3f3f3fff'],
  ['BLUE', '#0000ff'],
  ['NAVY', '#000080'],
  ['ROYAL', '#4169e1'],
  ['SLATE', '#708090'],
  ['SKY', '#87ceeb'],
  ['CYAN', '#00ffff'],
  ['TEAL', '#008080'],
  ['GREEN', '#00ff00'],
  ['ACID', '#7fff00'],
  ['LIME', '#32cd32'],
  ['FOREST', '#228b22'],
  ['OLIVE', '#6b8e23'],
  ['YELLOW', '#ffff00'],
  ['GOLD', '#ffd700'],
  ['GOLDENROD', '#daa520'],
  ['ORANGE', '#ffa500'],
  ['BROWN', '#8b4513'],
  ['TAN', '#d2b48c'],
  ['BRICK', '#b22222'],
  ['RED', '#ff0000'],
  ['SCARLET', '#ff341c'],
  ['CRIMSON', '#dc143c'],
  ['CORAL', '#ff7f50'],
  ['SALMON', '#fa8072'],
  ['PINK', '#ff69b4'],
  ['MAGENTA', '#ff00ff'],
  ['PURPLE', '#a020f0'],
  ['VIOLET', '#ee82ee'],
  ['MAROON', '#b03060'],
  ['ACCENT', '#ffd37f'],
  ['UNLAUNCHED', '#8982ed'],
  ['HIGHLIGHT', '#ffe0a5'],
  ['STAT', '#ffd37f'],
  ['NEGSTAT', '#e55454'],
];

function buildColors(): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const [upper, value] of ARC_COLOR_ENTRIES) {
    colors[upper] = value;
    colors[upper.toLowerCase().replaceAll('_', '')] = value;
  }
  return colors;
}

export const COLORS: Record<string, string> = buildColors();

export const SERVER_AUTHORITIES = [
  'server:console',
  'server:map',
  'server:mod',
  'server:workflow',
  'server:data',
  'server:file',
  'server:setting',
  'server:ingame-admin',
  'server:dashboard',
] as const;

export const USER_AUTHORITIES = ['user:server:credit:transfer'] as const;

export const ADMIN_AUTHORITIES = [
  'notification:manage',
  'user:manage',
  'server:manage',
  'schematic:manage',
  'schematic:delete',
  'map:manage',
  'map:delete',
  'post:manage',
  'post:delete',
  'mod:manage',
  'plugin:manage',
  'plugin:delete',
  'comment:manage',
  'tag:manage',
  'wiki:manage',
  'icon:manage',
  'planet:manage',
  'audit:view',
  'content-patch:manage',
  'content-patch:delete',
  'media:delete',
  'chat:delete',
  'god',
] as const;

export const AUTHORITIES = [...ADMIN_AUTHORITIES, ...USER_AUTHORITIES, ...SERVER_AUTHORITIES] as const;
export type AuthorityEnum = (typeof AUTHORITIES)[number];

export type Brand<K, T> = K & { __brand: T };
export type Megabyte = Brand<number, 'MB'>;
export type Byte = Brand<number, 'Byte'>;
