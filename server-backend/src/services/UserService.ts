import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../models/User';
import { UserInfo } from '../../proto/protocol';

/**
 * 用户服务层
 * 处理用户相关的业务逻辑
 */
export class UserService {
    
    /**
     * 注册新用户
     */
    async register(username: string, password: string, email?: string): Promise<{ success: boolean; userId?: string; message: string }> {
        try {
            // 检查用户名是否已存在
            const existingUser = await UserModel.findOne({ username });
            if (existingUser) {
                return { success: false, message: '用户名已存在' };
            }
            
            // 检查邮箱是否已存在
            if (email) {
                const existingEmail = await UserModel.findOne({ email });
                if (existingEmail) {
                    return { success: false, message: '邮箱已被注册' };
                }
            }
            
            // 密码加密
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // 创建用户
            const user = new UserModel({
                username,
                passwordHash,
                email,
                level: 1,
                score: 0,
                gold: 100, // 初始赠送 100 金币
                profession: 'none'
            });
            
            await user.save();
            
            console.log(`[UserService] 用户注册成功：${username}`);
            return { success: true, userId: user._id.toString(), message: '注册成功' };
        } catch (error) {
            console.error('[UserService] 注册失败:', error);
            return { success: false, message: '注册失败，请稍后重试' };
        }
    }
    
    /**
     * 用户登录
     */
    async login(username: string, password: string): Promise<{ success: boolean; user?: IUser; message: string }> {
        try {
            // 查找用户
            const user = await UserModel.findOne({ username });
            if (!user) {
                return { success: false, message: '用户名或密码错误' };
            }
            
            // 检查账户是否激活
            if (!user.isActive) {
                return { success: false, message: '账户已被禁用' };
            }
            
            // 验证密码
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return { success: false, message: '用户名或密码错误' };
            }
            
            // 更新最后登录时间
            user.lastLoginAt = new Date();
            await user.save();
            
            console.log(`[UserService] 用户登录成功：${username}`);
            return { success: true, user, message: '登录成功' };
        } catch (error) {
            console.error('[UserService] 登录失败:', error);
            return { success: false, message: '登录失败，请稍后重试' };
        }
    }
    
    /**
     * 获取用户信息
     */
    async getUserInfo(userId: string): Promise<{ success: boolean; userInfo?: UserInfo; message: string }> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return { success: false, message: '用户不存在' };
            }
            
            const userInfo: UserInfo = {
                userId: user._id.toString(),
                username: user.username,
                email: user.email,
                level: user.level,
                score: user.score,
                gold: user.gold,
                avatar: user.avatar,
                profession: user.profession,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            };
            
            return { success: true, userInfo, message: '获取成功' };
        } catch (error) {
            console.error('[UserService] 获取用户信息失败:', error);
            return { success: false, message: '获取用户信息失败' };
        }
    }
    
    /**
     * 更新用户积分和金币
     */
    async updateWallet(userId: string, scoreChange: number, goldChange: number): Promise<{ success: boolean; message: string }> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return { success: false, message: '用户不存在' };
            }
            
            user.score += scoreChange;
            user.gold += goldChange;
            
            // 确保金币不为负
            if (user.gold < 0) {
                user.gold = 0;
            }
            
            await user.save();
            
            console.log(`[UserService] 用户钱包更新：${userId}, score: ${scoreChange}, gold: ${goldChange}`);
            return { success: true, message: '更新成功' };
        } catch (error) {
            console.error('[UserService] 更新钱包失败:', error);
            return { success: false, message: '更新失败' };
        }
    }
}

export const userService = new UserService();
