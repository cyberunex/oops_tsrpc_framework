import { ApiCall } from 'tsrpc';
import { WsProtocol } from '../../proto/protocol';

/**
 * WebSocket 消息处理
 */

// 心跳处理
export async function wsHeartbeat(call: ApiCall<WsProtocol['heartbeat']>) {
    const { timestamp } = call.req;
    
    call.succ({
        timestamp,
        serverTime: Date.now()
    });
}

// 聊天消息处理
export async function wsMessageChat(call: ApiCall<WsProtocol['message/chat']>) {
    const { toUserId, content } = call.req;
    
    // 检查用户是否登录
    if (!call.caller.user) {
        call.succ({
            success: false,
            messageId: '',
            timestamp: Date.now()
        });
        return;
    }
    
    // 生成消息 ID
    const messageId = require('uuid').v4();
    
    console.log(`[WebSocket] 聊天消息：${call.caller.user.userId} -> ${toUserId}: ${content}`);
    
    // TODO: 将消息存储到数据库并推送给接收者
    
    call.succ({
        success: true,
        messageId,
        timestamp: Date.now()
    });
}
