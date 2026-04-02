/**
 * TSRPC 客户端配置和封装
 * 提供 HTTP 和 WebSocket 通信能力
 */

import { Client, ClientOptions } from 'tsrpc-client';

// API 协议类型定义（与后端 proto 对应）
export interface ApiProtocol {
    // 用户相关 API
    'user/register': {
        req: { username: string; password: string; email?: string };
        res: { success: boolean; userId?: string; message: string };
    };
    'user/login': {
        req: { username: string; password: string };
        res: { success: boolean; token?: string; userInfo?: UserInfo; message: string };
    };
    'user/info': {
        req: { userId: string };
        res: { success: boolean; userInfo?: UserInfo; message: string };
    };
    'user/refreshToken': {
        req: { refreshToken: string };
        res: { success: boolean; token?: string; message: string };
    };
    
    // Hello World 测试
    'system/hello': {
        req: { name: string };
        res: { success: boolean; message: string };
    };
}

// WebSocket 协议类型定义
export interface WsProtocol {
    // 心跳
    'heartbeat': {
        req: { timestamp: number };
        res: { timestamp: number; serverTime: number };
    };
    
    // 实时消息
    'message/chat': {
        req: { toUserId: string; content: string };
        res: { success: boolean; messageId: string };
    };
    'message/receive': {
        req: { fromUserId: string; content: string; timestamp: number };
        res: void;
    };
}

// 用户信息接口
export interface UserInfo {
    userId: string;
    username: string;
    email?: string;
    level: number;
    score: number;
    gold: number;
    avatar?: string;
    createdAt: Date;
    lastLoginAt?: Date;
}

// TSRPC 客户端单例
export class TsrpcClientManager {
    private static instance: TsrpcClientManager;
    private apiClient: Client<ApiProtocol>;
    private wsClient: Client<WsProtocol> | null = null;
    private token: string | null = null;
    private refreshTokenStr: string | null = null;
    
    private constructor() {
        const options: ClientOptions = {
            serverUrl: process.env.SERVER_URL || 'http://localhost:3000',
            wsUrl: process.env.WS_URL || 'ws://localhost:3001',
            debug: true,
            onError: (err) => {
                console.error('[TSRPC] 错误:', err);
            }
        };
        
        this.apiClient = new Client<ApiProtocol>(options);
    }
    
    public static getInstance(): TsrpcClientManager {
        if (!TsrpcClientManager.instance) {
            TsrpcClientManager.instance = new TsrpcClientManager();
        }
        return TsrpcClientManager.instance;
    }
    
    /**
     * 设置认证 Token
     */
    setToken(token: string, refreshToken?: string) {
        this.token = token;
        this.refreshTokenStr = refreshToken || null;
        // 保存到本地存储
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }
    
    /**
     * 从本地存储加载 Token
     */
    loadToken(): boolean {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (token) {
            this.token = token;
            this.refreshTokenStr = refreshToken;
            return true;
        }
        return false;
    }
    
    /**
     * 清除 Token
     */
    clearToken() {
        this.token = null;
        this.refreshTokenStr = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    }
    
    /**
     * 获取当前 Token
     */
    getToken(): string | null {
        return this.token;
    }
    
    /**
     * 调用 API
     */
    async callApi<T extends keyof ApiProtocol>(
        action: T,
        req: ApiProtocol[T]['req']
    ): Promise<ApiProtocol[T]['res']> {
        const headers: Record<string, string> = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            const result = await this.apiClient.call(action, req, { headers });
            return result;
        } catch (error) {
            console.error(`[TSRPC] API 调用失败：${action}`, error);
            throw error;
        }
    }
    
    /**
     * 连接 WebSocket
     */
    async connectWebSocket(): Promise<void> {
        if (this.wsClient) {
            console.log('[TSRPC] WebSocket 已连接');
            return;
        }
        
        const options: ClientOptions = {
            serverUrl: process.env.WS_URL || 'ws://localhost:3001',
            debug: true,
            onError: (err) => {
                console.error('[TSRPC] WebSocket 错误:', err);
            }
        };
        
        this.wsClient = new Client<WsProtocol>(options);
        
        // 连接成功后启动心跳
        this.wsClient.on('connect', () => {
            console.log('[TSRPC] WebSocket 连接成功');
            this.startHeartbeat();
        });
        
        // 监听接收消息
        this.wsClient.on('message/receive', (data) => {
            console.log('[TSRPC] 收到消息:', data);
            // 触发事件通知 UI
        });
    }
    
    /**
     * 断开 WebSocket
     */
    disconnectWebSocket() {
        if (this.wsClient) {
            this.wsClient.destroy();
            this.wsClient = null;
            console.log('[TSRPC] WebSocket 已断开');
        }
    }
    
    /**
     * 发送 WebSocket 消息
     */
    async sendWsMessage<T extends keyof WsProtocol>(
        action: T,
        req: WsProtocol[T]['req']
    ): Promise<WsProtocol[T]['res']> {
        if (!this.wsClient) {
            throw new Error('WebSocket 未连接');
        }
        
        const headers: Record<string, string> = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return await this.wsClient.call(action, req, { headers });
    }
    
    /**
     * 心跳保活
     */
    private startHeartbeat() {
        if (!this.wsClient) return;
        
        setInterval(async () => {
            try {
                const result = await this.wsClient!.call('heartbeat', {
                    timestamp: Date.now()
                });
                console.log('[TSRPC] 心跳响应:', result);
            } catch (error) {
                console.error('[TSRPC] 心跳失败:', error);
            }
        }, 30000); // 30 秒一次心跳
    }
}

// 导出单例
export const tsrpcClient = TsrpcClientManager.getInstance();
