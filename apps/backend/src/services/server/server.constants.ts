export const SERVER_CONSTANTS = {
  DEFAULT_CPU: 0.5,
  DEFAULT_MEMORY_MB: 512,
  LOGIN_TOKEN_EXPIRE_AFTER_MS: 1000 * 60 * 15,
  SERVER_LOG_EXPIRE_AFTER_MS: 1000 * 60 * 60 * 24 * 14,
  SERVER_CACHE_EXPIRE_AFTER_MS: 1000 * 60 * 5,
  SERVER_DELETED_AFTER_MS: 1000 * 60 * 60 * 24 * 30,
  MAX_WEBHOOK_EVENTS: 20,
  DEFAULT_CREDIT: 180,
  UPDATE_CONFIG_TIMEOUT_MS: 10_000,
  FLUSH_INTERVAL_MS: 1000,
  LOG_QUEUE_MAX_SIZE: 200,
  MAX_SERVER_LOGS: 10000,
  DISCORD_WEBHOOKS: [
    'https://discord.com/api/webhooks/1311537621465432105/4oDtpDj6gRTdrwucfCQaAX6n7SdRrIyRfU3zK10lGP5_MwnGn6gGIAwNJf5RnCu5iu_k',
  ],
};

export const SERVER_CACHE_KEYS = {
  server: (id: string) => `server:${id}`,
  serverList: ['server-list:0:100', 'server-list:0:20', 'server-list:0:10', 'server-list:0:50'],
  authorities: (id: string, userId: string) => `server:${id}:${userId}:authorities`,
  serverWebhooks: (id: string) => `server:${id}:webhooks`,
  groupWebhooks: (groupId: string) => `group:${groupId}:webhooks`,
};
