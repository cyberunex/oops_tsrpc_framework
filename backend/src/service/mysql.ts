import mysql from 'mysql2/promise';
import config from '../config';
import logger from './logger';

/**
 * MySQL 连接池管理
 */
class MySQL {
  private pool: mysql.Pool | null = null;
  private connected = false;

  /**
   * 初始化连接池
   */
  async connect(): Promise<void> {
    if (this.connected) {
      logger.info('MySQL already connected');
      return;
    }

    try {
      this.pool = mysql.createPool({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // 测试连接
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.connected = true;
      logger.info('MySQL connected successfully');

      // 监听错误
      this.pool.on('error', (err) => {
        logger.error('MySQL pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          this.connected = false;
        }
      });

      // 处理进程信号
      process.on('SIGINT', async () => {
        await this.close();
        process.exit(0);
      });
    } catch (error) {
      logger.error('MySQL connection failed:', error);
      throw error;
    }
  }

  /**
   * 获取连接
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    if (!this.pool || !this.connected) {
      throw new Error('MySQL not connected');
    }
    return await this.pool.getConnection();
  }

  /**
   * 执行查询
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    if (!this.pool || !this.connected) {
      throw new Error('MySQL not connected');
    }

    const [rows] = await this.pool.execute(sql, params);
    return rows as T;
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    if (!this.pool || !this.connected) {
      throw new Error('MySQL not connected');
    }

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    if (!this.pool || !this.connected) {
      return;
    }

    try {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
      logger.info('MySQL connection pool closed');
    } catch (error) {
      logger.error('MySQL close error:', error);
      throw error;
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected && this.pool !== null;
  }
}

export const mySQL = new MySQL();
export default mySQL;
