import { ApiCall } from 'tsrpc';
import { ApiProtocol } from '../../proto/protocol';
import { userService } from '../services/UserService';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../middleware/auth';

/**
 * 用户相关 API 实现
 */

// Hello World 测试
export async function apiSystemHello(call: ApiCall<ApiProtocol['system/hello']>) {
    const { name } = call.req;
    call.succ({
        success: true,
        message: `Hello, ${name}! Welcome to Game Hall!`
    });
}

// 用户注册
export async function apiUserRegister(call: ApiCall<ApiProtocol['user/register']>) {
    const { username, password, email } = call.req;
    
    // 参数验证
    if (!username || username.length < 3) {
        call.succ({ success: false, message: '用户名长度至少为 3 位' });
        return;
    }
    
    if (!password || password.length < 6) {
        call.succ({ success: false, message: '密码长度至少为 6 位' });
        return;
    }
    
    const result = await userService.register(username, password, email);
    call.succ(result);
}

// 用户登录
export async function apiUserLogin(call: ApiCall<ApiProtocol['user/login']>) {
    const { username, password } = call.req;
    
    // 参数验证
    if (!username || !password) {
        call.succ({ success: false, message: '用户名和密码不能为空' });
        return;
    }
    
    const loginResult = await userService.login(username, password);
    
    if (!loginResult.success || !loginResult.user) {
        call.succ({ success: false, message: loginResult.message });
        return;
    }
    
    // 生成 Token
    const token = generateAccessToken({
        userId: loginResult.user._id.toString(),
        username: loginResult.user.username
    });
    
    const refreshToken = generateRefreshToken(loginResult.user._id.toString());
    
    // 构建用户信息（不包含敏感数据）
    const userInfo = {
        userId: loginResult.user._id.toString(),
        username: loginResult.user.username,
        email: loginResult.user.email,
        level: loginResult.user.level,
        score: loginResult.user.score,
        gold: loginResult.user.gold,
        avatar: loginResult.user.avatar,
        profession: loginResult.user.profession,
        createdAt: loginResult.user.createdAt,
        lastLoginAt: loginResult.user.lastLoginAt
    };
    
    call.succ({
        success: true,
        token,
        refreshToken,
        userInfo,
        message: loginResult.message
    });
}

// 获取用户信息
export async function apiUserInfo(call: ApiCall<ApiProtocol['user/info']>) {
    const userId = call.req.userId || call.caller.user?.userId;
    
    if (!userId) {
        call.succ({ success: false, message: '未提供用户 ID 且未登录' });
        return;
    }
    
    const result = await userService.getUserInfo(userId);
    call.succ(result);
}

// 刷新 Token
export async function apiUserRefreshToken(call: ApiCall<ApiProtocol['user/refreshToken']>) {
    const { refreshToken } = call.req;
    
    try {
        // 验证 Refresh Token
        const decoded = verifyToken(refreshToken);
        if (!decoded || !('userId' in decoded)) {
            call.succ({ success: false, message: '无效的刷新令牌' });
            return;
        }
        
        // 生成新的 Access Token
        const newToken = generateAccessToken({
            userId: decoded.userId,
            username: decoded.username || ''
        });
        
        call.succ({
            success: true,
            token: newToken,
            message: 'Token 刷新成功'
        });
    } catch (error) {
        call.succ({ success: false, message: '刷新令牌已过期或无效' });
    }
}

// 用户登出
export async function apiUserLogout(call: ApiCall<ApiProtocol['user/logout']>) {
    // 在实际应用中，这里可以将 Token 加入黑名单
    call.succ({
        success: true,
        message: '登出成功'
    });
}
