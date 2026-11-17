import dns from 'node:dns/promises';
import geoip from 'geoip-country';

export async function resolveHostToIp(host: string): Promise<string | null> {
  // If host is already an IPv4 or IPv6, return directly
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(host) || host.includes(':')) {
    return host;
  }

  try {
    const result = await dns.lookup(host);
    return result.address || null;
  } catch {
    return null;
  }
}

export function lookupCountryCode(ip: string | null): string | null {
  if (!ip) return null;
  try {
    const geo = geoip.lookup(ip);
    return geo?.country || null;
  } catch {
    return null;
  }
}
