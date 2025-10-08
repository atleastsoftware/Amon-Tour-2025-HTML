// Shared Tour Ninja cache module for performance optimization
export const tourCache = {
  data: null as any,
  timestamp: 0,
  TTL: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};