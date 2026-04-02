import mongoose from 'mongoose';
import config from '../config';
import logger from './logger';

/**
 * MongoDB 连接管理
 */
class MongoDB {
  private connected = false;

  /**
   * 连接数据库
   */
  async connect(): Promise<void> {
    if (this.connected) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      await mongoose.connect(config.mongodb.uri);
      this.connected = true;
      logger.info('MongoDB connected successfully');

      // 监听事件
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.connected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.connected = false;
      });

      // 处理进程信号
      process.on('SIGINT', async () => {
        await this.close();
        process.exit(0);
      });
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.connected = false;
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('MongoDB close error:', error);
      throw error;
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }
}

export const mongoDB = new MongoDB();
export default mongoDB;
