interface CacheEntry { data: any[]; timestamp: number }
const cache: Record<string, CacheEntry> = {};
export const CACHE_TTL = 24 * 60 * 60 * 1000;
export const getCachedData = (language: string) => cache[`tours_${language}`] || null;
export const setCachedData = (language: string, data: any[]) => {
  cache[`tours_${language}`] = { data, timestamp: Date.now() };
};
export const clearCache = (language?: string) => {
  if (language) delete cache[`tours_${language}`];
  else Object.keys(cache).forEach((key) => delete cache[key]);
};