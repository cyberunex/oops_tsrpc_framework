/**
 * TSRPC 协议定义
 * 包含 API 和 WebSocket 的所有接口类型
 */

// ============ API 协议 ============

export interface ApiProtocol {
    // 系统相关
    'system/hello': {
        req: { name: string };
        res: { success: boolean; message: string };
    };
    
    // 用户相关
    'user/register': {
        req: { username: string; password: string; email?: string };
        res: { success: boolean; userId?: string; message: string };
    };
    
    'user/login': {
        req: { username: string; password: string };
        res: { 
            success: boolean; 
            token?: string; 
            refreshToken?: string;
            userInfo?: UserInfo; 
            message: string 
        };
    };
    
    'user/info': {
        req: { userId?: string };  // userId 为空时获取当前用户
        res: { success: boolean; userInfo?: UserInfo; message: string };
    };
    
    'user/refreshToken': {
        req: { refreshToken: string };
        res: { success: boolean; token?: string; message: string };
    };
    
    'user/logout': {
        req: {};
        res: { success: boolean; message: string };
    };
}

// ============ WebSocket 协议 ============

export interface WsProtocol {
    // 心跳
    'heartbeat': {
        req: { timestamp: number };
        res: { timestamp: number; serverTime: number };
    };
    
    // 聊天消息
    'message/chat': {
        req: { toUserId: string; content: string };
        res: { success: boolean; messageId: string; timestamp: number };
    };
}

// ============ 公共类型 ============

export interface UserInfo {
    userId: string;
    username: string;
    email?: string;
    level: number;
    score: number;
    gold: number;
    avatar?: string;
    profession?: string;
    createdAt: Date;
    lastLoginAt?: Date;
}

// JWT Payload 类型
export interface JWTPayload {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
}

// Refresh Token Payload 类型
export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;  // 用于使特定 token 失效
    iat?: number;
    exp?: number;
}
