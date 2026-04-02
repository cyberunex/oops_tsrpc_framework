import { _decorator, Component, Node, Label, EditBox, Button, sys, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

import { tsrpcClient } from '../network/TsrpcClient';
import { OopsFramework } from '../framework/OopsFramework';

/**
 * 登录/注册 UI 控制器
 */
@ccclass('LoginUI')
export class LoginUI extends Component {
    @property({ type: Node })
    loginPanel: Node | null = null;

    @property({ type: Node })
    registerPanel: Node | null = null;

    @property({ type: EditBox })
    usernameInput: EditBox | null = null;

    @property({ type: EditBox })
    passwordInput: EditBox | null = null;

    @property({ type: EditBox })
    emailInput: EditBox | null = null;

    @property({ type: Label })
    messageLabel: Label | null = null;

    @property({ type: Button })
    loginButton: Button | null = null;

    @property({ type: Button })
    registerButton: Button | null = null;

    @property({ type: Button })
    switchToRegisterButton: Button | null = null;

    @property({ type: Button })
    switchToLoginButton: Button | null = null;

    @property({ type: Button })
    helloTestButton: Button | null = null;

    private isLoginMode: boolean = true;

    onLoad() {
        this.showMessage('欢迎使用游戏大厅');
        
        // 检查是否有已保存的 Token
        if (tsrpcClient.loadToken()) {
            console.log('[Login] 发现已保存的 Token，尝试自动登录');
            this.showMessage('检测到已登录账户');
        }

        // 绑定按钮事件
        this.loginButton?.node.on(Button.EventType.CLICK, this.onLoginClick, this);
        this.registerButton?.node.on(Button.EventType.CLICK, this.onRegisterClick, this);
        this.switchToRegisterButton?.node.on(Button.EventType.CLICK, this.showRegister, this);
        this.switchToLoginButton?.node.on(Button.EventType.CLICK, this.showLogin, this);
        this.helloTestButton?.node.on(Button.EventType.CLICK, this.onHelloTestClick, this);

        // 初始显示登录面板
        this.showLogin();
    }

    /**
     * 显示登录面板
     */
    showLogin() {
        this.isLoginMode = true;
        if (this.loginPanel) this.loginPanel.active = true;
        if (this.registerPanel) this.registerPanel.active = false;
        this.showMessage('请输入账号密码');
    }

    /**
     * 显示注册面板
     */
    showRegister() {
        this.isLoginMode = false;
        if (this.loginPanel) this.loginPanel.active = false;
        if (this.registerPanel) this.registerPanel.active = true;
        this.showMessage('请填写注册信息');
    }

    /**
     * 登录按钮点击
     */
    async onLoginClick() {
        if (!this.usernameInput || !this.passwordInput) return;

        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();

        if (!username || !password) {
            this.showMessage('用户名和密码不能为空');
            return;
        }

        try {
            this.showMessage('登录中...');
            
            const result = await tsrpcClient.callApi('user/login', {
                username,
                password
            });

            if (result.success && result.token) {
                tsrpcClient.setToken(result.token);
                this.showMessage('登录成功！');
                
                // 连接 WebSocket
                await tsrpcClient.connectWebSocket();
                
                // 延迟跳转到大厅场景
                setTimeout(() => {
                    if (OopsFramework.instance) {
                        OopsFramework.instance.changeScene('HallScene');
                    }
                }, 1000);
            } else {
                this.showMessage(result.message || '登录失败');
            }
        } catch (error) {
            console.error('[Login] 登录异常:', error);
            this.showMessage('网络错误，请稍后重试');
        }
    }

    /**
     * 注册按钮点击
     */
    async onRegisterClick() {
        if (!this.usernameInput || !this.passwordInput) return;

        const username = this.usernameInput.string.trim();
        const password = this.passwordInput.string.trim();
        const email = this.emailInput ? this.emailInput.string.trim() : '';

        if (!username || !password) {
            this.showMessage('用户名和密码不能为空');
            return;
        }

        if (password.length < 6) {
            this.showMessage('密码长度至少为 6 位');
            return;
        }

        try {
            this.showMessage('注册中...');
            
            const result = await tsrpcClient.callApi('user/register', {
                username,
                password,
                email: email || undefined
            });

            if (result.success) {
                this.showMessage('注册成功！请登录');
                setTimeout(() => {
                    this.showLogin();
                }, 1500);
            } else {
                this.showMessage(result.message || '注册失败');
            }
        } catch (error) {
            console.error('[Login] 注册异常:', error);
            this.showMessage('网络错误，请稍后重试');
        }
    }

    /**
     * Hello World 测试按钮点击
     */
    async onHelloTestClick() {
        try {
            this.showMessage('测试通信中...');
            
            const result = await tsrpcClient.callApi('system/hello', {
                name: 'Cocos Creator 3D'
            });

            if (result.success) {
                this.showMessage(`服务器响应：${result.message}`);
                console.log('[Login] Hello World 测试成功:', result.message);
            } else {
                this.showMessage('测试失败');
            }
        } catch (error) {
            console.error('[Login] 测试异常:', error);
            this.showMessage('通信测试失败');
        }
    }

    /**
     * 显示消息
     */
    showMessage(msg: string) {
        if (this.messageLabel) {
            this.messageLabel.string = msg;
        }
        console.log(`[LoginUI] ${msg}`);
    }

    onDestroy() {
        // 清理事件监听
        this.loginButton?.node.off(Button.EventType.CLICK, this.onLoginClick, this);
        this.registerButton?.node.off(Button.EventType.CLICK, this.onRegisterClick, this);
        this.switchToRegisterButton?.node.off(Button.EventType.CLICK, this.showRegister, this);
        this.switchToLoginButton?.node.off(Button.EventType.CLICK, this.showLogin, this);
        this.helloTestButton?.node.off(Button.EventType.CLICK, this.onHelloTestClick, this);
    }
}
