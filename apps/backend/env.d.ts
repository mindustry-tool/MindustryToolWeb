declare namespace NodeJS {
  interface ProcessEnv {
    ENV: 'development' | 'production';
    DATABASE_URL: string;
    REDIS_HOST: string;
    API_V4_PORT: string;
  }
}
