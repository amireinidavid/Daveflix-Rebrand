import redis from "../config/redis";

export const cacheUtils = {
  // Set data with expiration
  async set(key: string, data: any, expiryInSeconds: number = 3600) {
    try {
      await redis.setex(key, expiryInSeconds, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Redis Set Error:", error);
      return false;
    }
  },

  // Get cached data
  async get(key: string) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis Get Error:", error);
      return null;
    }
  },

  // Delete cached data
  async delete(key: string) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("Redis Delete Error:", error);
      return false;
    }
  },

  // Clear all cached data
  async clear() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      console.error("Redis Clear Error:", error);
      return false;
    }
  },
};
