let cachedIpInfo: Record<string, unknown> | null = null;

export async function getIpInfo(): Promise<{
  ip?: string;
  city?: string;
  country?: string;
  region?: string;
  lat?: number;
  lon?: number;
}> {
  if (cachedIpInfo) return cachedIpInfo;
  try {
    const res = await fetch('https://ip-api.com/json', { cache: 'reload' });
    const data = await res.json();
    cachedIpInfo = {
      ip: data.query,
      city: data.city,
      country: data.country,
      region: data.regionName,
      lat: data.lat,
      lon: data.lon,
    };
    return cachedIpInfo;
  } catch {
    return {};
  }
} 