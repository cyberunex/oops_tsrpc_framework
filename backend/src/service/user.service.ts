import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config';
import mySQL from '../../service/mysql';
import { UserSession, GameLog } from '../../model/UserModel';
import { ErrorCode } from '../common/ErrorCode';
import logger from '../../config/logger';

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 哈希密码
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * 生成 JWT Token
   */
  generateToken(payload: { userId: number; username: string }): { token: string; refreshToken: string } {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { token, refreshToken };
  }

  /**
   * 验证 Token
   */
  verifyToken(token: string): { userId: number; username: string } | null {
    try {
      return jwt.verify(token, config.jwt.secret) as { userId: number; username: string };
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      return null;
    }

    // 检查 refresh token 是否在会话中
    const session = await UserSession.findOne({ refreshToken });
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return this.generateToken(payload);
  }

  /**
   * 创建会话
   */
  async createSession(
    userId: number,
    token: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 天过期

    await UserSession.create({
      userId,
      token,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });
  }

  /**
   * 删除会话
   */
  async deleteSession(token: string): Promise<void> {
    await UserSession.deleteOne({ token });
  }

  /**
   * 清理过期会话
   */
  async cleanupSessions(): Promise<void> {
    await UserSession.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  /**
   * 注册用户
   */
  async register(
    username: string,
    email: string,
    password: string,
    nickname?: string
  ): Promise<{ userId: number; username: string } | ErrorCode> {
    // 检查用户名是否存在
    const existingUser = await mySQL.query<any[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      const isUsername = existingUser[0].username === username;
      return isUsername ? ErrorCode.USERNAME_ALREADY_EXISTS : ErrorCode.EMAIL_ALREADY_EXISTS;
    }

    // 哈希密码
    const passwordHash = await this.hashPassword(password);

    // 插入用户
    const result = await mySQL.query<any>(
      'INSERT INTO users (username, email, password_hash, nickname) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, nickname || username]
    );

    return { userId: result.insertId, username };
  }

  /**
   * 登录用户
   */
  async login(
    username: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: any; tokens: { token: string; refreshToken: string } } | ErrorCode> {
    // 查询用户
    const users = await mySQL.query<any[]>(
      'SELECT id, username, email, password_hash, nickname, avatar_url, gender, level, experience, points, gold_coins, status, last_login_time FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return ErrorCode.USER_NOT_FOUND;
    }

    const user = users[0];

    // 检查用户状态
    if (user.status !== 1) {
      return ErrorCode.USER_DISABLED;
    }

    // 验证密码
    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return ErrorCode.PASSWORD_ERROR;
    }

    // 更新最后登录时间
    await mySQL.query(
      'UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
      [ipAddress, user.id]
    );

    // 生成 Token
    const tokens = this.generateToken({ userId: user.id, username: user.username });

    // 创建会话
    await this.createSession(user.id, tokens.token, tokens.refreshToken, ipAddress, userAgent);

    // 记录日志
    await this.logAction(user.id, 'login', `User logged in from ${ipAddress}`);

    return {
      user: {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        level: user.level,
        points: user.points,
        goldCoins: user.gold_coins,
      },
      tokens,
    };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number): Promise<any | ErrorCode> {
    const users = await mySQL.query<any[]>(
      'SELECT id, username, nickname, avatar_url, gender, level, experience, points, gold_coins, status, last_login_time FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return ErrorCode.USER_NOT_FOUND;
    }

    const user = users[0];
    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      gender: user.gender,
      level: user.level,
      experience: user.experience,
      points: user.points,
      goldCoins: user.gold_coins,
      status: user.status,
      lastLoginTime: user.last_login_time,
    };
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: number,
    updates: { nickname?: string; avatarUrl?: string; gender?: number }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.nickname !== undefined) {
      fields.push('nickname = ?');
      values.push(updates.nickname);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatarUrl);
    }
    if (updates.gender !== undefined) {
      fields.push('gender = ?');
      values.push(updates.gender);
    }

    if (fields.length === 0) {
      return true;
    }

    values.push(userId);
    await mySQL.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean | ErrorCode> {
    const users = await mySQL.query<any[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return ErrorCode.USER_NOT_FOUND;
    }

    const isValid = await this.verifyPassword(oldPassword, users[0].password_hash);
    if (!isValid) {
      return ErrorCode.PASSWORD_ERROR;
    }

    const newHash = await this.hashPassword(newPassword);
    await mySQL.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, userId]
    );

    // 使所有会话失效
    await UserSession.deleteMany({ userId });

    return true;
  }

  /**
   * 记录用户行为日志
   */
  async logAction(userId: number, action: string, message: string, metadata?: any): Promise<void> {
    await GameLog.create({
      userId,
      level: 'info',
      action,
      message,
      metadata: metadata || {},
    });
  }

  /**
   * 更新用户积分和金币
   */
  async updateCurrency(
    userId: number,
    pointsChange: number = 0,
    goldChange: number = 0
  ): Promise<{ points: number; goldCoins: number } | ErrorCode> {
    return await mySQL.transaction(async (connection) => {
      // 锁定行
      const [rows] = await connection.query<any[]>(
        'SELECT points, gold_coins FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );

      if (rows.length === 0) {
        throw new Error('User not found');
      }

      const newPoints = rows[0].points + pointsChange;
      const newGold = rows[0].gold_coins + goldChange;

      if (newPoints < 0 || newGold < 0) {
        throw new Error('Insufficient currency');
      }

      await connection.query(
        'UPDATE users SET points = ?, gold_coins = ? WHERE id = ?',
        [newPoints, newGold, userId]
      );

      return { points: newPoints, goldCoins: newGold };
    });
  }
}

export const userService = new UserService();
export default userService;
