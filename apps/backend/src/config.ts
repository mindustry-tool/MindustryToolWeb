// (BigInt.prototype as any).toJSON = function () {
//     return this.toString();
// };

const resolveRedisUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  if (process.platform === 'win32' && rawUrl.includes('@redis:')) {
    return rawUrl.replace('@redis:', '@localhost:');
  }
  return rawUrl;
};

const config = () => ({
  domain: process.env.DOMAIN as string,
  port: parseInt(process.env.API_V4_PORT || '8080'),
  url: {
    frontend: process.env.FRONTEND_URL as string,
  },
  redis: {
    url: resolveRedisUrl(process.env.REDIS_URL),
  },
  contentParser: {
    url: process.env.CONTENT_PARSER_URL as string,
  },
  localeImage: {
    url: process.env.LOCAL_IMAGE_URL as string,
    username: process.env.LOCAL_IMAGE_USERNAME as string,
    password: process.env.LOCAL_IMAGE_PASSWORD as string,
  },
  auth: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      callbackURL: process.env.DISCORD_CALLBACK_URL as string,
      botToken: process.env.DISCORD_BOT_TOKEN as string,
      guildId: process.env.DISCORD_GUILD_ID as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    jwt: {
      password: process.env.APP_JWT_PASSWORD as string,
    },
  },
  github: {
    pat: process.env.GITHUB_PAT as string,
  },
  upload: {
    dataFolder: process.env.UPLOAD_DATA_FOLDER as string,
  },
  serverManager: {
    accessTokenSecret: (process.env.SERVER_MANAGER_ACCESS_TOKEN_SECRET as string) || 'dev-only-token',
  },
  minio: {
    endPoint: (process.env.MINIO_ENDPOINT as string) || 'localhost',
    port: parseInt((process.env.MINIO_PORT as string) || '9000'),
    useSSL: (process.env.MINIO_USE_SSL as string) === 'true',
    accessKey: process.env.RUSTFS_ACCESS_KEY as string,
    secretKey: process.env.RUSTFS_SECRET_KEY as string,
    publicUrl: process.env.MINIO_PUBLIC_URL as string,
  },
});

export default config;

export interface AppConfig {
  port: number;
  url: {
    frontend: string;
  };
  redis: {
    url: string;
  };
  auth: {
    discord: {
      clientId: string;
      clientSecret: string;
      callbackURL: string;
      scope: string[];
    };
    google: {
      clientId: string;
      clientSecret: string;
      callbackURL: string;
    };
  };
}
