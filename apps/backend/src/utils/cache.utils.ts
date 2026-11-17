type CacheLike = {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<unknown>;
};

export async function isDownloadRecently(
  cache: CacheLike,
  ip: string,
  itemId: string,
) {
  const key = `download:${ip}:${itemId}`;
  const data = await cache.get(key);

  if (data) {
    return true;
  }

  // 1hour
  await cache.set(key, 1, 1000 * 60 * 60);
  return false;
}
