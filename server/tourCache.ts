// Shared Tour Ninja cache module for performance optimization
// Now supports multiple languages with separate cache entries
interface CacheEntry {
  data: any;
  timestamp: number;
}

export const tourCache: Record<string, CacheEntry> = {};

export const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function getCacheKey(language: string): string {
  return `tours_${language}`;
}

export function getCachedData(language: string): CacheEntry | null {
  const key = getCacheKey(language);
  return tourCache[key] || null;
}

export function setCachedData(language: string, data: any): void {
  const key = getCacheKey(language);
  tourCache[key] = {
    data,
    timestamp: Date.now()
  };
}

export function clearCache(language?: string): void {
  if (language) {
    const key = getCacheKey(language);
    delete tourCache[key];
  } else {
    // Clear all language caches
    Object.keys(tourCache).forEach(key => delete tourCache[key]);
  }
}