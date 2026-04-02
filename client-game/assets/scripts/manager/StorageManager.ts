import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 本地存储管理器
 * 负责用户数据、游戏进度、设置等的持久化存储
 */
@ccclass('StorageManager')
export class StorageManager extends Component {
    private static instance: StorageManager | null = null;

    static getInstance(): StorageManager | null {
        return StorageManager.instance;
    }

    onLoad() {
        if (!StorageManager.instance) {
            StorageManager.instance = this;
        } else {
            this.destroy();
            return;
        }
        
        console.log('[Storage] 存储管理器初始化完成');
    }

    /**
     * 保存数据
     */
    save(key: string, value: any): boolean {
        try {
            const stringValue = JSON.stringify(value);
            sys.localStorage.setItem(key, stringValue);
            console.log(`[Storage] 保存数据：${key}`);
            return true;
        } catch (error) {
            console.error(`[Storage] 保存数据失败：${key}`, error);
            return false;
        }
    }

    /**
     * 获取数据
     */
    get<T>(key: string, defaultValue?: T): T | null {
        try {
            const value = sys.localStorage.getItem(key);
            if (value === null) {
                return defaultValue !== undefined ? defaultValue : null;
            }
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`[Storage] 获取数据失败：${key}`, error);
            return defaultValue !== undefined ? defaultValue : null;
        }
    }

    /**
     * 删除数据
     */
    remove(key: string): boolean {
        try {
            sys.localStorage.removeItem(key);
            console.log(`[Storage] 删除数据：${key}`);
            return true;
        } catch (error) {
            console.error(`[Storage] 删除数据失败：${key}`, error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clear(): boolean {
        try {
            sys.localStorage.clear();
            console.log('[Storage] 清空所有数据');
            return true;
        } catch (error) {
            console.error('[Storage] 清空数据失败', error);
            return false;
        }
    }

    /**
     * 保存用户设置
     */
    saveUserSettings(settings: Record<string, any>): boolean {
        return this.save('user_settings', settings);
    }

    /**
     * 获取用户设置
     */
    getUserSettings(): Record<string, any> | null {
        return this.get<Record<string, any>>('user_settings', {});
    }

    /**
     * 保存游戏进度
     */
    saveGameProgress(userId: string, progress: any): boolean {
        return this.save(`game_progress_${userId}`, progress);
    }

    /**
     * 获取游戏进度
     */
    getGameProgress(userId: string): any | null {
        return this.get<any>(`game_progress_${userId}`);
    }

    /**
     * 保存积分金币信息
     */
    saveWallet(userId: string, wallet: { score: number; gold: number }): boolean {
        return this.save(`wallet_${userId}`, wallet);
    }

    /**
     * 获取积分金币信息
     */
    getWallet(userId: string): { score: number; gold: number } | null {
        return this.get<{ score: number; gold: number }>(`wallet_${userId}`, { score: 0, gold: 0 });
    }
}
