import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { Server as HttpServer } from 'http';
import { Server as WsServer } from 'ws';

import config from './config';
import { authMiddleware } from './middleware/auth';
import { ApiProtocol, WsProtocol } from '../proto/protocol';
import { 
    apiSystemHello, 
    apiUserRegister, 
    apiUserLogin, 
    apiUserInfo, 
    apiUserRefreshToken,
    apiUserLogout 
} from './api/user.api';
import { wsHeartbeat, wsMessageChat } from './websocket/ws.handler';

// TSRPC 相关导入
import { createTsrpcHttpMiddleware, createTsrpcWsMiddleware } from 'tsrpc';

async function main() {
    // ============ 数据库连接 ============
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('[MongoDB] 连接成功');
    } catch (error) {
        console.error('[MongoDB] 连接失败:', error);
        process.exit(1);
    }

    // ============ Express 应用 ============
    const app = express();
    
    // 中间件
    app.use(helmet()); // 安全头
    app.use(cors()); // CORS
    app.use(compression()); // Gzip 压缩
    app.use(express.json()); // JSON 解析
    
    // 日志中间件
    app.use((req, res, next) => {
        console.log(`[HTTP] ${req.method} ${req.path}`);
        next();
    });
    
    // 速率限制
    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests
    });
    app.use('/api/', limiter);

    // ============ TSRPC HTTP API 中间件 ============
    const httpMiddleware = createTsrpcHttpMiddleware<ApiProtocol>({
        apis: {
            'system/hello': apiSystemHello,
            'user/register': apiUserRegister,
            'user/login': apiUserLogin,
            'user/info': apiUserInfo,
            'user/refreshToken': apiUserRefreshToken,
            'user/logout': apiUserLogout
        },
        middlewares: [
            // JWT 认证中间件（可选，部分接口需要认证）
            async (call, next) => {
                // 公开接口不需要认证
                const publicApis = ['system/hello', 'user/register', 'user/login'];
                if (publicApis.includes(call.action)) {
                    return next();
                }
                
                // 其他接口需要认证
                return authMiddleware(call.req as any, call.res as any, next);
            }
        ]
    });
    
    app.use('/api', httpMiddleware);

    // ============ 健康检查接口 ============
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: Date.now() });
    });

    // ============ 启动 HTTP 服务器 ============
    const httpServer = new HttpServer(app);
    
    httpServer.listen(config.port, () => {
        console.log(`[HTTP Server] 监听端口：${config.port}`);
        console.log(`[API] http://localhost:${config.port}/api`);
        console.log(`[Health] http://localhost:${config.port}/health`);
    });

    // ============ WebSocket 服务器 ============
    const wsServer = new WsServer({ 
        server: httpServer,
        path: '/ws'
    });
    
    const wsMiddleware = createTsrpcWsMiddleware<WsProtocol>({
        apis: {
            'heartbeat': wsHeartbeat,
            'message/chat': wsMessageChat
        },
        middlewares: [
            async (call, next) => {
                // WebSocket 也需要 JWT 认证
                // 从 URL 或第一个消息中获取 token
                return next();
            }
        ]
    });
    
    wsServer.on('connection', (socket, request) => {
        console.log('[WebSocket] 新连接');
        
        // 处理 TSRPC WebSocket 消息
        wsMiddleware(socket, request);
        
        socket.on('close', () => {
            console.log('[WebSocket] 连接关闭');
        });
        
        socket.on('error', (error) => {
            console.error('[WebSocket] 错误:', error);
        });
    });

    console.log(`[WebSocket] ws://localhost:${config.port}/ws`);

    // ============ 优雅关闭 ============
    process.on('SIGINT', async () => {
        console.log('\n[Server] 正在关闭...');
        httpServer.close();
        wsServer.close();
        await mongoose.connection.close();
        console.log('[Server] 已关闭');
        process.exit(0);
    });
}

main().catch(console.error);
