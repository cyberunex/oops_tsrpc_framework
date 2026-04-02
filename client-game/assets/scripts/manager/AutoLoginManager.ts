import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { tsrpcClient } from '../network/TsrpcClient';
import { OopsFramework } from '../framework/OopsFramework';

/**
 * 自动登录和 Token 刷新管理器
 */
@ccclass('AutoLoginManager')
export class AutoLoginManager extends Component {
    private static instance: AutoLoginManager | null = null;
    private refreshTokenTimer: number | null = null;

    static getInstance(): AutoLoginManager | null {
        return AutoLoginManager.instance;
    }

    onLoad() {
        if (!AutoLoginManager.instance) {
            AutoLoginManager.instance = this;
        } else {
            this.destroy();
            return;
        }
        
        console.log('[AutoLogin] 自动登录管理器初始化完成');
        
        // 检查是否有 Token，有则尝试自动登录
        this.checkAutoLogin();
    }

    /**
     * 检查自动登录
     */
    async checkAutoLogin() {
        if (!tsrpcClient.loadToken()) {
            console.log('[AutoLogin] 未找到 Token，跳过自动登录');
            return;
        }

        console.log('[AutoLogin] 发现 Token，验证有效性...');
        
        try {
            // 这里可以调用一个验证接口来检查 Token 是否有效
            // 暂时先假设 Token 有效，直接连接 WebSocket
            await tsrpcClient.connectWebSocket();
            console.log('[AutoLogin] Token 有效，自动登录成功');
            
            // 启动定时刷新
            this.startRefreshTimer();
        } catch (error) {
            console.error('[AutoLogin] Token 验证失败:', error);
            tsrpcClient.clearToken();
        }
    }

    /**
     * 启动定时刷新 Token
     */
    startRefreshTimer() {
        // 每 25 分钟刷新一次 Token（JWT 通常 30 分钟过期）
        if (this.refreshTokenTimer) {
            clearInterval(this.refreshTokenTimer);
        }

        this.refreshTokenTimer = setInterval(async () => {
            await this.refreshToken();
        }, 25 * 60 * 1000);

        console.log('[AutoLogin] 已启动 Token 定时刷新');
    }

    /**
     * 停止定时刷新
     */
    stopRefreshTimer() {
        if (this.refreshTokenTimer) {
            clearInterval(this.refreshTokenTimer);
            this.refreshTokenTimer = null;
            console.log('[AutoLogin] 已停止 Token 定时刷新');
        }
    }

    /**
     * 刷新 Token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.log('[AutoLogin] 未找到 Refresh Token，跳过刷新');
            return;
        }

        try {
            console.log('[AutoLogin] 正在刷新 Token...');
            
            const result = await tsrpcClient.callApi('user/refreshToken', {
                refreshToken
            });

            if (result.success && result.token) {
                tsrpcClient.setToken(result.token, refreshToken);
                console.log('[AutoLogin] Token 刷新成功');
            } else {
                console.warn('[AutoLogin] Token 刷新失败，可能需要重新登录');
                tsrpcClient.clearToken();
                this.stopRefreshTimer();
                
                // 跳转回登录场景
                if (OopsFramework.instance) {
                    OopsFramework.instance.changeScene('LoginScene');
                }
            }
        } catch (error) {
            console.error('[AutoLogin] Token 刷新异常:', error);
        }
    }

    onDestroy() {
        this.stopRefreshTimer();
    }
}
