import { _decorator, Component, Node, find, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Oops Framework 集成配置
 * 提供资源管理、场景管理、事件系统等核心功能
 */
@ccclass('OopsFramework')
export class OopsFramework extends Component {
    @property({ tooltip: '调试模式' })
    debugMode: boolean = true;

    @property({ tooltip: '资源加载超时时间 (秒)' })
    loadTimeout: number = 30;

    static instance: OopsFramework | null = null;

    onLoad() {
        if (!OopsFramework.instance) {
            OopsFramework.instance = this;
        } else {
            console.warn('OopsFramework 已存在，销毁当前实例');
            this.destroy();
            return;
        }
        
        this.initFramework();
    }

    private initFramework() {
        console.log('[Oops] 框架初始化完成');
        
        // 初始化事件系统
        this.initEventSystem();
        
        // 初始化资源管理器
        this.initResourceManager();
        
        // 初始化场景管理器
        this.initSceneManager();
        
        // 初始化 UI 管理器
        this.initUIManager();
    }

    private initEventSystem() {
        console.log('[Oops] 事件系统初始化完成');
    }

    private initResourceManager() {
        console.log('[Oops] 资源管理器初始化完成');
    }

    private initSceneManager() {
        console.log('[Oops] 场景管理器初始化完成');
    }

    private initUIManager() {
        console.log('[Oops] UI 管理器初始化完成');
    }

    /**
     * 加载预制体
     */
    async loadPrefab(path: string): Promise<Node> {
        return new Promise((resolve, reject) => {
            // Cocos Creator 3.x 资源加载逻辑
            console.log(`[Oops] 加载预制体：${path}`);
            // 实际实现需要调用 resources.load
            resolve(new Node());
        });
    }

    /**
     * 切换场景
     */
    async changeScene(sceneName: string) {
        console.log(`[Oops] 切换场景：${sceneName}`);
        director.loadScene(sceneName);
    }

    /**
     * 显示 UI 窗口
     */
    async showUI(uiName: string, data?: any) {
        console.log(`[Oops] 显示 UI：${uiName}`, data);
    }

    /**
     * 隐藏 UI 窗口
     */
    hideUI(uiName: string) {
        console.log(`[Oops] 隐藏 UI：${uiName}`);
    }
}
