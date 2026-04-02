import Redis from 'ioredis';
import config from '../config';
import logger from './logger';

/**
 * Redis 连接管理
 */
class RedisClient {
  private client: Redis | null = null;
  private connected = false;

  /**
   * 连接 Redis
   */
  async connect(): Promise<void> {
    if (this.connected) {
      logger.info('Redis already connected');
      return;
    }

    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => {
          if (times > 10) {
            logger.error('Redis max retries reached');
            return null;
          }
          return Math.min(times * 50, 2000);
        },
      });

      this.client.on('connect', () => {
        this.connected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.connected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis connection ended');
        this.connected = false;
      });

      // 处理进程信号
      process.on('SIGINT', async () => {
        await this.close();
        process.exit(0);
      });
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  /**
   * 获取客户端实例
   */
  getClient(): Redis {
    if (!this.client || !this.connected) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    const client = this.getClient();
    if (expireSeconds) {
      await client.setex(key, expireSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  /**
   * 获取键值
   */
  async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<number> {
    const client = this.getClient();
    return await client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (!this.client || !this.connected) {
      return;
    }

    try {
      await this.client.quit();
      this.client = null;
      this.connected = false;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Redis close error:', error);
      throw error;
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected && this.client !== null;
  }
}

export const redisClient = new RedisClient();
export default redisClient;
