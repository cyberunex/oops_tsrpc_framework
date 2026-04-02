import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JWTPayload } from '../../proto/protocol';

// 扩展 Express Request 类型
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * JWT 认证中间件
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 从 Header 获取 Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: '未提供认证令牌' 
            });
        }
        
        const token = authHeader.substring(7);
        
        // 验证 Token
        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                success: false, 
                message: '令牌已过期',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: '无效的令牌' 
        });
    }
};

/**
 * 可选的 JWT 认证中间件（Token 存在则验证，不存在则跳过）
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
            req.user = decoded;
        }
        next();
    } catch (error) {
        // Token 无效时忽略，继续执行
        next();
    }
};

/**
 * 生成 Access Token
 */
export function generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, { 
        expiresIn: config.jwt.expiresIn 
    });
}

/**
 * 生成 Refresh Token
 */
export function generateRefreshToken(userId: string): string {
    const tokenId = require('uuid').v4();
    return jwt.sign(
        { userId, tokenId }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.refreshExpiresIn }
    );
}

/**
 * 验证并解析 Token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
        return null;
    }
}
